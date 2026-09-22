import type { Prisma } from '@/generated/prisma/client';
import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
} from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { orderRepository } from '@/repositories/order.repository';

type UiOrderStatus =
  | 'Menunggu Bayar'
  | 'Dikonfirmasi'
  | 'Pengemasan'
  | 'Dikirim'
  | 'Diterima'
  | 'Dibatalkan';

const ADMIN_EDITABLE_ORDER_STATUSES = new Set<OrderStatus>([
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.delivered,
]);

const DEFAULT_PAYMENT_TIMEOUT_MINUTES = 60;

function getPaymentTimeoutMinutes() {
  const rawValue = Number(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES ?? '30');

  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return DEFAULT_PAYMENT_TIMEOUT_MINUTES;
  }

  return Math.floor(rawValue);
}

export function getOrderPaymentExpiryDate(createdAt: Date) {
  return new Date(createdAt.getTime() + getPaymentTimeoutMinutes() * 60 * 1000);
}

function mapToUiOrderStatus(order: {
  orderStatus: string;
  paymentStatus: string;
}): UiOrderStatus {
  if (order.orderStatus === 'cancelled' || order.paymentStatus === 'failed') {
    return 'Dibatalkan';
  }
  if (order.orderStatus === 'delivered') {
    return 'Diterima';
  }
  if (order.orderStatus === 'shipped') {
    return 'Dikirim';
  }
  if (order.orderStatus === 'processing') {
    return 'Pengemasan';
  }
  if (order.orderStatus === 'confirmed') {
    return 'Dikonfirmasi';
  }
  return 'Menunggu Bayar';
}

function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatOrderCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function mapToPaymentStatusLabel(paymentStatus: string) {
  if (paymentStatus === 'paid') return 'Lunas';
  if (paymentStatus === 'failed') return 'Gagal';
  if (paymentStatus === 'refunded') return 'Refund';
  return 'Belum Bayar';
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

function extractReservedItemsFromOrder(order: {
  productId: string;
  variantId: string | null;
  quantity: number;
  customerNotes: string | null;
}) {
  const checkoutItems = parseJsonTag(
    order.customerNotes,
    'checkout_items',
  ) as Array<{
    productId?: string;
    variantId?: string | null;
    quantity?: number;
  }> | null;

  if (checkoutItems && checkoutItems.length > 0) {
    return checkoutItems
      .filter(
        (item) =>
          typeof item.productId === 'string' &&
          item.productId &&
          typeof item.quantity === 'number' &&
          item.quantity > 0,
      )
      .map((item) => ({
        productId: item.productId as string,
        variantId: item.variantId ?? null,
        quantity: item.quantity as number,
      }));
  }

  return [
    {
      productId: order.productId,
      variantId: order.variantId,
      quantity: order.quantity,
    },
  ];
}

type PaymentTransactionSummary = {
  status?: string;
  expiredAt?: Date | null;
  paymentUrl?: string | null;
  vaNumber?: string | null;
  paidAt?: Date | null;
  createdAt?: Date;
  id?: string;
};

function getLatestPaymentTransaction(order: {
  paymentTransactions: PaymentTransactionSummary[];
}) {
  return order.paymentTransactions[0] || null;
}

function getPaymentDeadlineAt(order: {
  createdAt: Date;
  paymentTransactions: PaymentTransactionSummary[];
}) {
  return (
    getLatestPaymentTransaction(order)?.expiredAt ??
    getOrderPaymentExpiryDate(order.createdAt)
  );
}

function canCancelPendingOrder(order: {
  orderStatus: string;
  paymentStatus: string;
  paymentTransactions: PaymentTransactionSummary[];
}) {
  if (
    order.orderStatus !== OrderStatus.pending ||
    order.paymentStatus !== PaymentStatus.unpaid
  ) {
    return false;
  }

  const latestPayment = getLatestPaymentTransaction(order);
  if (!latestPayment) {
    return true;
  }

  if (latestPayment.status !== PaymentTransactionStatus.pending) {
    return false;
  }

  return !latestPayment.expiredAt || latestPayment.expiredAt > new Date();
}

async function cancelOrderAndRestoreStock(
  order: {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    customerNotes: string | null;
    orderStatus: string;
    paymentStatus: string;
    paymentTransactions: Array<{
      status: string;
      expiredAt?: Date | null;
    }>;
  },
  reason: 'user_cancelled' | 'expired' | 'failed',
) {
  if (
    order.orderStatus === OrderStatus.cancelled ||
    order.paymentStatus === PaymentStatus.paid
  ) {
    return false;
  }

  if (
    order.orderStatus !== OrderStatus.pending ||
    order.paymentStatus !== PaymentStatus.unpaid
  ) {
    return false;
  }

  const restoredItems = extractReservedItemsFromOrder(order).filter(
    (item) => item.variantId && item.quantity > 0,
  );
  const paymentTransactionStatus =
    reason === 'expired'
      ? PaymentTransactionStatus.expired
      : PaymentTransactionStatus.failed;
  const now = new Date();

  await orderRepository.cancelOrderAndRestoreStock(
    order.id,
    restoredItems.map((item) => ({
      variantId: item.variantId!,
      quantity: item.quantity,
    })),
    paymentTransactionStatus,
    reason === 'expired' ? now : undefined,
  );

  return true;
}

async function reconcileExpiredOrders(userId?: string) {
  const expiredOrders = await orderRepository.findExpiredPendingOrders(
    new Date(),
    userId,
  );

  for (const order of expiredOrders) {
    await cancelOrderAndRestoreStock(order, 'expired');
  }
}

async function mapAdminOrder(order: {
  id: string;
  orderNumber: string;
  quantity: number;
  totalAmount: { toNumber(): number } | number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  createdAt: Date;
  customerNotes: string | null;
  productId: string;
  variantId: string | null;
  productPrice: { toNumber(): number } | number | null;
  user: { id: string; name: string; email: string };
  product: {
    id: string;
    name: string;
    province: string;
    clothingType: string;
    imageURL: string | null;
  };
}) {
  const effectiveOrderStatus =
    order.paymentStatus === PaymentStatus.failed ||
    order.orderStatus === OrderStatus.cancelled
      ? OrderStatus.cancelled
      : (order.orderStatus as OrderStatus);

  const totalAmount =
    typeof order.totalAmount === 'number'
      ? order.totalAmount
      : order.totalAmount.toNumber();

  // Extract checkout items from customerNotes if available
  const checkoutItems = parseJsonTag(
    order.customerNotes,
    'checkout_items',
  ) as Array<{
    productId?: string;
    quantity?: number;
    unitPrice?: number;
    productName?: string;
    province?: string;
    clothingType?: string;
  }> | null;

  // Build products array from checkout items or fallback to single product
  let products: Array<{
    id: string;
    name: string;
    location: string;
    category: string;
    quantity: number;
    unitPrice: string;
  }>;

  if (checkoutItems && checkoutItems.length > 0) {
    const validCheckoutItems = checkoutItems.filter(
      (item) =>
        typeof item.productId === 'string' &&
        item.productId &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    );

    // Map each item, filling in missing data from database if needed
    products = await Promise.all(
      validCheckoutItems.map(async (item) => {
        // Use item's unitPrice if available, otherwise use order's productPrice
        const itemUnitPrice =
          typeof item.unitPrice === 'number'
            ? item.unitPrice
            : typeof order.productPrice === 'number'
              ? order.productPrice
              : (order.productPrice?.toNumber() ?? 0);

        // If we have complete data from checkout_items, use it
        if (item.productName && item.province && item.clothingType) {
          return {
            id: item.productId as string,
            name: item.productName,
            location: item.province,
            category: item.clothingType,
            quantity: item.quantity as number,
            unitPrice: formatOrderCurrency(itemUnitPrice),
          };
        }

        // Otherwise, query database to fill in missing data
        const dbProduct = await orderRepository.findProductDetailsForOrder(
          item.productId as string,
        );

        return {
          id: item.productId as string,
          name: dbProduct?.name || item.productName || 'Unknown Product',
          location: dbProduct?.province || item.province || 'Unknown Location',
          category:
            dbProduct?.clothingType || item.clothingType || 'Unknown Category',
          quantity: item.quantity as number,
          unitPrice: formatOrderCurrency(itemUnitPrice),
        };
      }),
    );
  } else {
    // Fallback to single product from order table
    const singleProductPrice =
      typeof order.productPrice === 'number'
        ? order.productPrice
        : (order.productPrice?.toNumber() ?? 0);

    products = [
      {
        id: order.product.id,
        name: order.product.name,
        location: order.product.province,
        category: order.product.clothingType,
        quantity: order.quantity,
        unitPrice: formatOrderCurrency(singleProductPrice),
      },
    ];
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
    },
    products,
    totalAmount,
    totalAmountLabel: formatOrderCurrency(totalAmount),
    orderStatus: effectiveOrderStatus,
    orderStatusLabel: mapToUiOrderStatus(order),
    paymentStatus: order.paymentStatus,
    paymentStatusLabel: mapToPaymentStatusLabel(order.paymentStatus),
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    createdAtLabel: formatOrderDate(order.createdAt),
  };
}

export const orderService = {
  getUserOrders: async (
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    await reconcileExpiredOrders(userId);

    let filters: Prisma.OrderWhereInput = {};

    if (status && status !== 'Semua') {
      switch (status) {
        case 'Menunggu Bayar':
          filters = {
            OR: [{ orderStatus: 'pending' }, { paymentStatus: 'unpaid' }],
          };
          break;
        case 'Dikonfirmasi':
          filters = { orderStatus: 'confirmed' };
          break;
        case 'Pengemasan':
          filters = { orderStatus: 'processing' };
          break;
        case 'Dikirim':
          filters = { orderStatus: 'shipped' };
          break;
        case 'Diterima':
          filters = { orderStatus: 'delivered' };
          break;
        case 'Dibatalkan':
          filters = {
            OR: [{ orderStatus: 'cancelled' }, { paymentStatus: 'failed' }],
          };
          break;
        default:
          break;
      }
    }

    const skip = (page - 1) * limit;

    const [orders, totalItems] = await Promise.all([
      orderRepository.findOrdersByUserId(userId, filters, skip, limit),
      orderRepository.countOrdersByUserId(userId, filters),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const uiStatus = mapToUiOrderStatus(order);
        const paymentDeadlineAt =
          uiStatus === 'Menunggu Bayar' ? getPaymentDeadlineAt(order) : null;

        // Extract checkout_items to get all products
        const checkoutItems = parseJsonTag(
          order.customerNotes,
          'checkout_items',
        ) as Array<{
          productId?: string;
          quantity?: number;
          productName?: string;
          province?: string;
          clothingType?: string;
          imageURL?: string | null;
          unitPrice?: number;
        }> | null;

        const fallbackUnitPrice =
          Number(order.totalAmount) / Math.max(order.quantity, 1);

        let products;
        if (checkoutItems && checkoutItems.length > 0) {
          // Build from checkout_items with enrichment when a snapshot exists.
          products = [];
          for (const item of checkoutItems) {
            if (
              !(
                typeof item.productId === 'string' &&
                item.productId &&
                typeof item.quantity === 'number' &&
                item.quantity > 0
              )
            ) {
              continue;
            }

            // Check if item has complete metadata
            const hasCompleteMetadata =
              item.productName &&
              item.province &&
              item.clothingType &&
              item.imageURL;

            let product = {
              category: item.clothingType || order.product.clothingType,
              name: item.productName || 'Unknown Product',
              location: item.province || order.product.province,
              quantity: item.quantity as number,
              imageURL: item.imageURL || null,
              unitPrice: formatOrderCurrency(
                item.unitPrice ?? fallbackUnitPrice,
              ),
            };

            // If metadata is incomplete, enrich from database
            if (!hasCompleteMetadata) {
              const productDetail =
                await orderRepository.findProductDetailsForOrder(
                  item.productId,
                );
              if (productDetail) {
                product = {
                  category: item.clothingType || productDetail.clothingType,
                  name: item.productName || productDetail.name,
                  location: item.province || productDetail.province,
                  quantity: item.quantity as number,
                  imageURL:
                    item.imageURL ||
                    (
                      productDetail as typeof productDetail & {
                        imageURL?: string | null;
                      }
                    ).imageURL ||
                    null,
                  unitPrice: formatOrderCurrency(
                    item.unitPrice ?? fallbackUnitPrice,
                  ),
                };
              }
            }

            products.push(product);
          }
        } else {
          // Single item - use primary product
          products = [
            {
              category: order.product.clothingType,
              name: order.product.name,
              location: order.product.province,
              quantity: order.quantity,
              imageURL: order.product.imageURL,
              unitPrice: formatOrderCurrency(fallbackUnitPrice),
            },
          ];
        }

        return {
          orderId: order.id,
          id: order.orderNumber || order.id,
          date: formatOrderDate(order.createdAt),
          totalPrice: formatOrderCurrency(Number(order.totalAmount)),
          status: uiStatus,
          paymentStatus: order.paymentStatus,
          paymentStatusLabel: mapToPaymentStatusLabel(order.paymentStatus),
          paymentDeadlineAt: paymentDeadlineAt?.toISOString() ?? null,
          canCancel: canCancelPendingOrder(order),
          products,
          actions: ['Detail'] as 'Detail'[],
        };
      }),
    );

    return {
      data: formattedOrders,
      meta: {
        total: totalItems,
        page,
        limit,
        totalPages,
      },
    };
  },

  getUserOrderDetail: async (userId: string, identifier: string) => {
    await reconcileExpiredOrders(userId);

    const order = await orderRepository.findOrderDetailByIdentifier(
      userId,
      identifier,
    );

    if (!order) {
      throw new ApiError('Pesanan tidak ditemukan', 404);
    }

    const latestPayment = getLatestPaymentTransaction(order);
    const paymentDeadlineAt =
      order.orderStatus === OrderStatus.pending &&
      order.paymentStatus === PaymentStatus.unpaid
        ? getPaymentDeadlineAt(order)
        : null;

    // Extract checkout_items to get all products
    const checkoutItems = parseJsonTag(
      order.customerNotes,
      'checkout_items',
    ) as Array<{
      productId?: string;
      quantity?: number;
      unitPrice?: number;
      productName?: string;
      province?: string;
      clothingType?: string;
      imageURL?: string | null;
    }> | null;

    let products;
    if (checkoutItems && checkoutItems.length > 1) {
      // Multiple items - build from checkout_items with enrichment
      products = [];
      for (const item of checkoutItems) {
        if (
          !(
            typeof item.productId === 'string' &&
            item.productId &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
          )
        ) {
          continue;
        }

        // Check if item has complete metadata
        const hasCompleteMetadata =
          item.productName &&
          item.province &&
          item.clothingType &&
          item.imageURL;

        // Use item's unitPrice if available, otherwise use order's productPrice
        const itemUnitPrice =
          typeof item.unitPrice === 'number'
            ? item.unitPrice
            : Number(order.productPrice);

        let product = {
          id: item.productId,
          name: item.productName || 'Unknown Product',
          category: item.clothingType || order.product.clothingType,
          location: item.province || order.product.province,
          quantity: item.quantity as number,
          unitPrice: formatOrderCurrency(itemUnitPrice),
          imageURL: item.imageURL || null,
        };

        // If metadata is incomplete, enrich from database
        if (!hasCompleteMetadata) {
          const productDetail =
            await orderRepository.findProductDetailsForOrder(item.productId);
          if (productDetail) {
            product = {
              id: item.productId,
              name: item.productName || productDetail.name,
              category: item.clothingType || productDetail.clothingType,
              location: item.province || productDetail.province,
              quantity: item.quantity as number,
              unitPrice: formatOrderCurrency(itemUnitPrice),
              imageURL:
                item.imageURL ||
                (
                  productDetail as typeof productDetail & {
                    imageURL?: string | null;
                  }
                ).imageURL ||
                null,
            };
          }
        }

        products.push(product);
      }
    } else {
      // Single item - use primary product
      products = [
        {
          id: order.product.id,
          name: order.product.name,
          category: order.product.clothingType,
          location: order.product.province,
          quantity: order.quantity,
          unitPrice: formatOrderCurrency(Number(order.productPrice)),
          imageURL: order.product.imageURL,
        },
      ];
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: formatOrderDate(order.createdAt),
      orderStatus: mapToUiOrderStatus(order),
      paymentStatus: order.paymentStatus,
      paymentStatusLabel: mapToPaymentStatusLabel(order.paymentStatus),
      paymentMethod: order.paymentMethod,
      paymentDeadlineAt: paymentDeadlineAt?.toISOString() ?? null,
      canCancel: canCancelPendingOrder(order),
      totals: {
        subtotal: formatOrderCurrency(Number(order.subtotal)),
        shippingCost: formatOrderCurrency(Number(order.shippingCost)),
        totalAmount: formatOrderCurrency(Number(order.totalAmount)),
      },
      products,
      shipping: {
        courier: order.courier,
        courierService: order.courierService,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        recipientName: order.shippingAddress.recipientName,
        recipientPhone: order.shippingAddress.phone,
        fullAddress: order.shippingAddress.fullAddress,
        city: order.shippingAddress.city,
        province: order.shippingAddress.province,
        district: order.shippingAddress.district,
        subdistrict: order.shippingAddress.subdistrict,
        postalCode: order.shippingAddress.postalCode,
      },
      paymentTransaction: latestPayment
        ? {
            id: latestPayment.id,
            status: latestPayment.status,
            paymentUrl: latestPayment.paymentUrl,
            vaNumber: latestPayment.vaNumber,
            paidAt: latestPayment.paidAt,
            expiredAt: latestPayment.expiredAt,
            createdAt: latestPayment.createdAt,
          }
        : null,
      customerNotes: order.customerNotes,
    };
  },

  cancelUserOrder: async (userId: string, identifier: string) => {
    await reconcileExpiredOrders(userId);

    const order = await orderRepository.findOrderForUserByIdentifier(
      userId,
      identifier,
    );

    if (!order) {
      throw new ApiError('Pesanan tidak ditemukan', 404);
    }

    if (!canCancelPendingOrder(order)) {
      throw new ApiError(
        'Pesanan ini tidak dapat dibatalkan karena pembayaran sudah diproses atau masa bayar telah habis',
        400,
      );
    }

    await cancelOrderAndRestoreStock(order, 'user_cancelled');

    return orderService.getUserOrderDetail(userId, identifier);
  },

  cancelOrderBySystemId: async (
    orderId: string,
    reason: 'expired' | 'failed',
  ) => {
    const order = await orderRepository.findOrderForCancellationById(orderId);

    if (!order) {
      throw new ApiError('Pesanan tidak ditemukan', 404);
    }

    await cancelOrderAndRestoreStock(order, reason);
  },

  getAdminOrders: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ) => {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const where: Prisma.OrderWhereInput = {};
    if (filters?.orderStatus) {
      where.orderStatus = filters.orderStatus;
    }
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    const [orders, totalItems] = await Promise.all([
      orderRepository.findOrdersForAdmin(where, offset, safeLimit),
      orderRepository.countOrdersForAdmin(where),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    const mappedItems = await Promise.all(orders.map(mapAdminOrder));

    return {
      items: mappedItems,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
      },
    };
  },

  updateOrderForAdmin: async (
    identifier: string,
    data: {
      orderStatus?: OrderStatus;
      trackingNumber?: string | null;
      customerNotes?: string | null;
    },
  ) => {
    const existing =
      await orderRepository.findOrderForAdminByIdentifier(identifier);

    if (!existing) {
      throw new ApiError('Pesanan tidak ditemukan', 404);
    }

    if (
      existing.orderStatus === OrderStatus.cancelled ||
      existing.paymentStatus === PaymentStatus.failed
    ) {
      throw new ApiError('Pesanan dibatalkan dan tidak dapat diubah', 400);
    }

    if (existing.paymentStatus !== PaymentStatus.paid) {
      throw new ApiError(
        'Pesanan hanya dapat diubah jika pembayaran sudah berhasil',
        400,
      );
    }

    if (
      data.orderStatus !== undefined &&
      !ADMIN_EDITABLE_ORDER_STATUSES.has(data.orderStatus)
    ) {
      throw new ApiError(
        'Status pesanan hanya dapat diubah ke Pengemasan, Dikirim, atau Diterima',
        400,
      );
    }

    const now = new Date();
    const nextData: Prisma.OrderUpdateInput = {
      orderStatus: data.orderStatus,
      trackingNumber:
        data.trackingNumber === undefined
          ? undefined
          : data.trackingNumber?.trim()
            ? data.trackingNumber.trim()
            : null,
      customerNotes: data.customerNotes,
    };

    if (data.orderStatus === OrderStatus.shipped) {
      nextData.shippedAt = now;
    }
    if (data.orderStatus === OrderStatus.delivered) {
      nextData.deliveredAt = now;
    }

    const updated = await orderRepository.updateOrderForAdmin(
      identifier,
      nextData,
    );

    return await mapAdminOrder(updated);
  },
};
