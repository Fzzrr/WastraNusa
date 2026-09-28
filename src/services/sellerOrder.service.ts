import type { Prisma } from '@/generated/prisma/client';
import { OrderStatus, PaymentStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { formatIDR } from '@/lib/utils';
import { sellerOrderRepository } from '@/repositories/sellerOrder.repository';

type UiOrderStatus =
  | 'Menunggu Bayar'
  | 'Dikonfirmasi'
  | 'Pengemasan'
  | 'Dikirim'
  | 'Diterima'
  | 'Dibatalkan';

const SELLER_EDITABLE_ORDER_STATUSES = new Set<OrderStatus>([
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.delivered,
]);

function mapToUiOrderStatus(order: {
  orderStatus: string;
  paymentStatus: string;
}): UiOrderStatus {
  if (order.orderStatus === 'cancelled' || order.paymentStatus === 'failed') {
    return 'Dibatalkan';
  }
  if (order.orderStatus === 'delivered') return 'Diterima';
  if (order.orderStatus === 'shipped') return 'Dikirim';
  if (order.orderStatus === 'processing') return 'Pengemasan';
  if (order.orderStatus === 'confirmed') return 'Dikonfirmasi';
  return 'Menunggu Bayar';
}

function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function mapToPaymentStatusLabel(paymentStatus: string) {
  if (paymentStatus === 'paid') return 'Lunas';
  if (paymentStatus === 'failed') return 'Gagal';
  if (paymentStatus === 'refunded') return 'Refund';
  return 'Belum Bayar';
}

function isValidCheckoutItem<
  T extends { productId?: string; quantity?: number },
>(item: T): item is T & { productId: string; quantity: number } {
  return (
    typeof item.productId === 'string' &&
    Boolean(item.productId) &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
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
async function mapSellerOrder(order: {
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

  let products: Array<{
    id: string;
    name: string;
    location: string;
    category: string;
    quantity: number;
    unitPrice: string;
  }>;

  if (checkoutItems && checkoutItems.length > 0) {
    const validCheckoutItems = checkoutItems.filter(isValidCheckoutItem);

    products = await Promise.all(
      validCheckoutItems.map(async (item) => {
        const itemUnitPrice =
          typeof item.unitPrice === 'number'
            ? item.unitPrice
            : typeof order.productPrice === 'number'
              ? order.productPrice
              : (order.productPrice?.toNumber() ?? 0);

        if (item.productName && item.province && item.clothingType) {
          return {
            id: item.productId as string,
            name: item.productName,
            location: item.province,
            category: item.clothingType,
            quantity: item.quantity as number,
            unitPrice: formatIDR(itemUnitPrice),
          };
        }

        const dbProduct =
          await sellerOrderRepository.findProductDetailsForOrder(
            item.productId as string,
          );

        return {
          id: item.productId as string,
          name: dbProduct?.name || item.productName || 'Unknown Product',
          location: dbProduct?.province || item.province || 'Unknown Location',
          category:
            dbProduct?.clothingType || item.clothingType || 'Unknown Category',
          quantity: item.quantity as number,
          unitPrice: formatIDR(itemUnitPrice),
        };
      }),
    );
  } else {
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
        unitPrice: formatIDR(singleProductPrice),
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
    totalAmountLabel: formatIDR(totalAmount),
    orderStatus: effectiveOrderStatus,
    orderStatusLabel: mapToUiOrderStatus(order),
    paymentStatus: order.paymentStatus,
    paymentStatusLabel: mapToPaymentStatusLabel(order.paymentStatus),
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    createdAtLabel: formatOrderDate(order.createdAt),
  };
}

/**
 * Business logic for a seller managing the orders placed for THEIR products.
 * `sellerId` is the authenticated seller's user id (from `withApiSeller`); it
 * scopes every read and is enforced before every mutation.
 */
export const sellerOrderService = {
  getSellerOrders: async (
    sellerId: string,
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
      sellerOrderRepository.findOrdersBySeller(
        sellerId,
        where,
        offset,
        safeLimit,
      ),
      sellerOrderRepository.countOrdersBySeller(sellerId, where),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    const mappedItems = await Promise.all(orders.map(mapSellerOrder));

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

  updateOrderForSeller: async (
    sellerId: string,
    identifier: string,
    data: {
      orderStatus?: OrderStatus;
      trackingNumber?: string | null;
      customerNotes?: string | null;
    },
  ) => {
    const existing = await sellerOrderRepository.findOrderForSellerByIdentifier(
      sellerId,
      identifier,
    );

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
      !SELLER_EDITABLE_ORDER_STATUSES.has(data.orderStatus)
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

    // Update by the resolved owned id so ownership is enforced.
    const updated = await sellerOrderRepository.updateOrderForSeller(
      existing.id,
      nextData,
    );

    logger.info('Seller order updated successfully', {
      orderId: existing.id,
      sellerId,
    });

    return await mapSellerOrder(updated);
  },
};
