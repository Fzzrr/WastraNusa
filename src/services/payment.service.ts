import type { PaymentTransactionStatus } from '@/generated/prisma/client';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { createMidtransTransaction, verifySignatureKey } from '@/lib/midtrans';
import { addressRepository } from '@/repositories/address.repository';
import { cartRepository } from '@/repositories/cart.repository';
import { orderRepository } from '@/repositories/order.repository';
import { paymentTransactionRepository } from '@/repositories/paymentTransaction.repository';
import { productRepository } from '@/repositories/product.repository';
import { productVariantRepository } from '@/repositories/productVariant.repository';
import type {
  CheckoutInput,
  MidtransNotificationInput,
} from '@/schemas/payment.schema';
import {
  getOrderPaymentExpiryDate,
  orderService,
} from '@/services/order.service';

interface CheckoutResolvedItem {
  cartItemIds: string[];
  productId: string;
  variantId: string | null;
  quantity: number;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  province: string;
  clothingType: string;
  imageURL: string | null;
}

function sumVariantStock(
  variants: Array<{
    stock: number;
  }>,
) {
  return variants.reduce((total, variant) => total + variant.stock, 0);
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}
/**
 * Maps Midtrans transaction_status to our PaymentTransactionStatus enum.
 */
function mapTransactionStatus(
  transactionStatus: string,
): PaymentTransactionStatus {
  switch (transactionStatus) {
    case 'capture':
    case 'settlement':
      return 'success';
    case 'pending':
      return 'pending';
    case 'deny':
    case 'cancel':
      return 'failed';
    case 'expire':
      return 'expired';
    default:
      return 'pending';
  }
}

/**
 * Maps Midtrans transaction_status to our Order PaymentStatus enum.
 */
function mapPaymentStatus(
  transactionStatus: string,
): 'unpaid' | 'paid' | 'failed' {
  switch (transactionStatus) {
    case 'capture':
    case 'settlement':
      return 'paid';
    case 'deny':
    case 'cancel':
    case 'expire':
      return 'failed';
    default:
      return 'unpaid';
  }
}

function aggregateCheckoutItems(input: CheckoutInput): Array<{
  cartItemIds: string[];
  productId: string;
  variantId: string | null;
  quantity: number;
}> {
  const map = new Map<
    string,
    {
      cartItemIds: string[];
      productId: string;
      variantId: string | null;
      quantity: number;
    }
  >();

  for (const item of input.items) {
    const variantId = item.variantId ?? null;
    const key = `${item.productId}:${variantId ?? 'default'}`;
    const existing = map.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      if (item.cartItemId && !existing.cartItemIds.includes(item.cartItemId)) {
        existing.cartItemIds.push(item.cartItemId);
      }
      continue;
    }

    map.set(key, {
      cartItemIds: item.cartItemId ? [item.cartItemId] : [],
      productId: item.productId,
      variantId,
      quantity: item.quantity,
    });
  }

  return Array.from(map.values());
}

function parseJsonTag(customerNotes: string | null | undefined, tag: string) {
  if (!customerNotes) return null;

  const marker = `${tag}=`;
  const start = customerNotes.indexOf(marker);
  if (start < 0) return null;

  const jsonStart = start + marker.length;
  const jsonEnd = customerNotes.indexOf(' | ', jsonStart);
  const jsonRaw =
    jsonEnd >= 0
      ? customerNotes.slice(jsonStart, jsonEnd)
      : customerNotes.slice(jsonStart);

  try {
    return JSON.parse(jsonRaw);
  } catch {
    return null;
  }
}

function extractPurchasedItemsFromOrder(order: {
  productId: string;
  variantId: string | null;
  customerNotes: string | null;
}) {
  const checkoutItems = parseJsonTag(
    order.customerNotes,
    'checkout_items',
  ) as Array<{ productId?: string; variantId?: string | null }> | null;

  if (checkoutItems && checkoutItems.length > 0) {
    return checkoutItems
      .filter((item) => typeof item.productId === 'string' && item.productId)
      .map((item) => ({
        productId: item.productId as string,
        variantId: item.variantId ?? null,
      }));
  }

  return [{ productId: order.productId, variantId: order.variantId }];
}

function extractPurchasedCartItemIds(order: { customerNotes: string | null }) {
  const explicitIds = parseJsonTag(
    order.customerNotes,
    'checkout_cart_item_ids',
  ) as string[] | null;

  if (Array.isArray(explicitIds) && explicitIds.length > 0) {
    return explicitIds.filter((id) => typeof id === 'string' && id.length > 0);
  }

  const checkoutItems = parseJsonTag(
    order.customerNotes,
    'checkout_items',
  ) as Array<{ cartItemIds?: string[] }> | null;

  if (!checkoutItems || checkoutItems.length === 0) {
    return [];
  }

  const uniqueIds = new Set<string>();
  for (const item of checkoutItems) {
    if (!Array.isArray(item.cartItemIds)) continue;
    for (const id of item.cartItemIds) {
      if (typeof id === 'string' && id.length > 0) {
        uniqueIds.add(id);
      }
    }
  }

  return Array.from(uniqueIds);
}

export const paymentService = {
  checkout: async (input: CheckoutInput, userId: string) => {
    let shippingAddressId: string;

    if (input.shippingAddressId) {
      const shippingAddress = await addressRepository.findById(
        input.shippingAddressId,
        userId,
      );
      if (!shippingAddress) {
        throw new ApiError('Shipping address not found', 404);
      }
      shippingAddressId = shippingAddress.id;
      logger.info('use address id from req', {
        shippingAddressId,
      });
    } else {
      const defaultAddress = await addressRepository.findDefaultByUser(userId);
      if (!defaultAddress) {
        throw new ApiError('Default shipping address not found', 400);
      }
      shippingAddressId = defaultAddress.id;
      logger.info('use default id since no address id passed');
    }

    const mergedItems = aggregateCheckoutItems(input);
    const resolvedItems: CheckoutResolvedItem[] = [];

    for (const item of mergedItems) {
      const product = await productRepository.findProductById(item.productId);
      if (!product) {
        throw new ApiError(`Product not found: ${item.productId}`, 404);
      }
      if (product.status !== 'active') {
        throw new ApiError(`Product is not available: ${product.name}`, 400);
      }

      let variantName: string | null = null;
      let unitPrice = Number(product.price);
      let resolvedVariantId: string | null = null;

      if (item.variantId) {
        const variant = await productVariantRepository.findVariantById(
          item.variantId,
        );
        if (!variant) {
          throw new ApiError('Variant not found', 404);
        }
        if (variant.productId !== product.id) {
          throw new ApiError('Variant does not belong to this product', 400);
        }
        if (variant.stock < item.quantity) {
          throw new ApiError(
            `Insufficient variant stock for ${product.name}`,
            400,
          );
        }

        resolvedVariantId = variant.id;
        variantName = variant.name;
        if (variant.price !== null) {
          unitPrice = Number(variant.price);
        }
      }

      const totalProductStock = sumVariantStock(product.variants);

      if (totalProductStock < item.quantity) {
        throw new ApiError(
          `Insufficient product stock for ${product.name}`,
          400,
        );
      }

      resolvedItems.push({
        cartItemIds: item.cartItemIds,
        productId: product.id,
        variantId: resolvedVariantId,
        quantity: item.quantity,
        productName: product.name,
        variantName,
        unitPrice,
        province: product.province,
        clothingType: product.clothingType,
        imageURL: product.imageURL,
      });
    }

    const subtotal = resolvedItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );
    const totalAmount = subtotal + input.shippingCost;

    const totalQuantity = resolvedItems.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
    const primaryItem = resolvedItems[0];

    if (!primaryItem) {
      throw new ApiError('No checkout items were provided', 400);
    }

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const paymentTransactionId = crypto.randomUUID();
    const paymentExpiredAt = getOrderPaymentExpiryDate(new Date());

    const itemSnapshot = resolvedItems.map((item) => ({
      cartItemIds: item.cartItemIds,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productName: item.productName,
      province: item.province,
      clothingType: item.clothingType,
      imageURL: item.imageURL,
    }));
    const checkoutCartItemIds = Array.from(
      new Set(itemSnapshot.flatMap((item) => item.cartItemIds)),
    );

    const customerNotes = [
      input.customerNotes,
      resolvedItems.length > 0
        ? `checkout_items=${JSON.stringify(itemSnapshot)}`
        : null,
      checkoutCartItemIds.length > 0
        ? `checkout_cart_item_ids=${JSON.stringify(checkoutCartItemIds)}`
        : null,
    ]
      .filter(Boolean)
      .join(' | ');

    await orderRepository.createOrder({
      id: orderId,
      orderNumber,
      userId,
      productId: primaryItem.productId,
      variantId: primaryItem.variantId,
      productName:
        resolvedItems.length === 1
          ? primaryItem.productName
          : `${primaryItem.productName} +${resolvedItems.length - 1} item(s)`,
      variantName: resolvedItems.length === 1 ? primaryItem.variantName : null,
      quantity: totalQuantity,
      productPrice: subtotal,
      shippingAddressId,
      courier: input.courier,
      courierService: input.courierService,
      estimatedDelivery: input.estimatedDelivery ?? null,
      subtotal,
      shippingCost: input.shippingCost,
      totalAmount,
      customerNotes: customerNotes || null,
    });

    for (const item of resolvedItems) {
      if (item.variantId) {
        await productVariantRepository.decrementVariantStock(
          item.variantId,
          item.quantity,
        );
      }
    }

    let midtransResponse;
    try {
      midtransResponse = await createMidtransTransaction(orderId, totalAmount);
    } catch (error) {
      logger.error('Failed to create Midtrans transaction', {
        orderId,
        error,
      });
      await orderService
        .cancelOrderBySystemId(orderId, 'failed')
        .catch((cancelError) => {
          logger.error('Failed to rollback order after Midtrans error', {
            orderId,
            cancelError,
          });
        });
      throw new ApiError('Failed to create payment transaction', 502);
    }

    await paymentTransactionRepository.createPaymentTransaction({
      id: paymentTransactionId,
      orderId,
      externalId: orderId,
      amount: totalAmount,
      status: 'pending',
      paymentUrl: midtransResponse.redirect_url,
      expiredAt: paymentExpiredAt,
      createdAt: new Date(),
    });

    logger.info('Checkout completed successfully', {
      orderId,
      orderNumber,
      totalAmount,
      itemCount: resolvedItems.length,
    });

    return {
      orderId,
      orderNumber,
      token: midtransResponse.token,
      redirect_url: midtransResponse.redirect_url,
    };
  },

  handleNotification: async (payload: MidtransNotificationInput) => {
    const {
      order_id,
      transaction_status,
      gross_amount,
      signature_key,
      status_code,
      payment_type,
      fraud_status,
    } = payload;

    const isValid = await verifySignatureKey(
      order_id,
      status_code,
      gross_amount,
      signature_key,
    );

    if (!isValid) {
      logger.warn('Invalid Midtrans signature key', { order_id });
      throw new ApiError('Invalid signature key', 403);
    }

    const transaction =
      await paymentTransactionRepository.findTransactionByExternalId(order_id);
    if (!transaction) {
      logger.warn('Payment transaction not found for notification', {
        order_id,
      });
      return;
    }

    const order = await orderRepository.findOrderById(order_id);
    if (!order) {
      logger.warn('Order not found for notification', { order_id });
      return;
    }

    if (
      transaction_status === 'capture' &&
      fraud_status &&
      fraud_status !== 'accept'
    ) {
      logger.warn('Transaction flagged by fraud detection', {
        order_id,
        fraud_status,
      });
      await paymentTransactionRepository.updatePaymentStatus(order_id, {
        status: 'failed',
      });
      await orderService.cancelOrderBySystemId(order_id, 'failed');
      return;
    }

    const paymentTxStatus = mapTransactionStatus(transaction_status);
    const paymentStatus = mapPaymentStatus(transaction_status);
    const isPaid =
      transaction_status === 'settlement' || transaction_status === 'capture';
    const paidAt = isPaid ? new Date() : null;

    await paymentTransactionRepository.updatePaymentStatus(order_id, {
      status: paymentTxStatus,
      paidAt,
    });

    if (isPaid) {
      await orderRepository.updateOrderPaymentStatus(order_id, {
        paymentStatus,
        paymentMethod: payment_type,
        paidAt,
        orderStatus: 'confirmed' as const,
      });
    } else {
      await orderService.cancelOrderBySystemId(
        order_id,
        transaction_status === 'expire' ? 'expired' : 'failed',
      );

      await orderRepository.updateOrderPaymentStatus(order_id, {
        paymentStatus,
        paymentMethod: payment_type,
        paidAt,
      });
    }

    if (isPaid) {
      const order = await orderRepository.findOrderById(order_id);

      if (!order) {
        logger.warn('Paid order not found for cart cleanup', { order_id });
      } else {
        const cartItemIds = extractPurchasedCartItemIds(order);
        const purchasedItems = extractPurchasedItemsFromOrder(order);

        const byIdResult = await cartRepository.removePurchasedItemsById(
          order.userId,
          cartItemIds,
        );
        const byProductVariantResult =
          await cartRepository.removePurchasedItemsByProductVariant(
            order.userId,
            purchasedItems,
          );

        logger.info('Removed purchased items from cart', {
          order_id,
          userId: order.userId,
          removedByIdCount: byIdResult.count,
          removedByProductVariantCount: byProductVariantResult.count,
          purchasedItemCount: purchasedItems.length,
        });
      }
    }

    logger.info('Midtrans notification processed', {
      order_id,
      transaction_status,
      paymentTxStatus,
      paymentStatus,
    });
  },
};
