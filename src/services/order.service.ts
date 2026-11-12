import type { Prisma } from '@/generated/prisma/client';
import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
} from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { logError, logger } from '@/lib/logger';
import {
  expireMidtransTransaction,
  getMidtransTransactionStatus,
} from '@/lib/midtrans';
import { formatIDR } from '@/lib/utils';
import { orderRepository } from '@/repositories/order.repository';
import { midtransNotificationSchema } from '@/schemas/payment.schema';
// payment.service imports this module too; both only use each other inside
// functions, so the cycle is safe.
import { paymentService } from '@/services/payment.service';

type UiOrderStatus =
  | 'Menunggu Bayar'
  | 'Dikonfirmasi'
  | 'Pengemasan'
  | 'Dikirim'
  | 'Diterima'
  | 'Dibatalkan';

// Fulfilment only moves forward: confirmed → processing → shipped → delivered.
const FULFILMENT_STEPS: OrderStatus[] = [
  OrderStatus.confirmed,
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.delivered,
];

// Single source of truth for the payment window; also sent to Midtrans as `expiry`.
const DEFAULT_PAYMENT_TIMEOUT_MINUTES = 30;

function getPaymentTimeoutMinutes() {
  const rawValue = Number(
    process.env.ORDER_PAYMENT_TIMEOUT_MINUTES ??
      DEFAULT_PAYMENT_TIMEOUT_MINUTES,
  );

  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return DEFAULT_PAYMENT_TIMEOUT_MINUTES;
  }

  return Math.floor(rawValue);
}

export function getOrderPaymentExpiryDate(createdAt: Date) {
  return new Date(createdAt.getTime() + getPaymentTimeoutMinutes() * 60 * 1000);
}

export function mapToUiOrderStatus(order: {
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

export function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

// Midtrans `payment_type` values, as a buyer would call them.
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Transfer Bank (VA)',
  echannel: 'Mandiri Bill',
  permata: 'Permata VA',
  credit_card: 'Kartu Kredit',
  gopay: 'GoPay',
  shopeepay: 'ShopeePay',
  qris: 'QRIS',
  cstore: 'Gerai Retail',
  akulaku: 'Akulaku',
  kredivo: 'Kredivo',
};

export function formatPaymentMethod(method: string | null) {
  if (!method) return null;
  return PAYMENT_METHOD_LABELS[method] ?? method.replace(/_/g, ' ');
}

export function mapToPaymentStatusLabel(paymentStatus: string) {
  if (paymentStatus === 'paid') return 'Lunas';
  if (paymentStatus === 'failed') return 'Gagal';
  if (paymentStatus === 'refunded') return 'Refund';
  return 'Belum Bayar';
}

type OrderItemRow = {
  productId: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: { toString(): string } | number;
  imageURL: string | null;
  province: string;
  clothingType: string;
};

export function mapOrderItems(items: OrderItemRow[]) {
  return items.map((item) => ({
    id: item.productId,
    name: item.productName,
    variant: item.variantName,
    category: item.clothingType,
    location: item.province,
    quantity: item.quantity,
    unitPrice: formatIDR(Number(item.unitPrice)),
    imageURL: item.imageURL,
  }));
}

/** Order row as seen by an admin or seller managing it. */
export function mapManagedOrder(order: {
  id: string;
  orderNumber: string;
  totalAmount: { toString(): string } | number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  createdAt: Date;
  courier: string;
  courierService: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    fullAddress: string;
    subdistrict: string | null;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  user: { id: string; name: string; email: string };
  items: OrderItemRow[];
}) {
  const address = order.shippingAddress;
  const effectiveOrderStatus =
    order.paymentStatus === PaymentStatus.failed ||
    order.orderStatus === OrderStatus.cancelled
      ? OrderStatus.cancelled
      : (order.orderStatus as OrderStatus);
  const totalAmount = Number(order.totalAmount);

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
    },
    // The seller needs to know where to ship.
    shipping: {
      recipientName: address.recipientName,
      phone: address.phone,
      address: [
        address.fullAddress,
        address.subdistrict,
        address.district,
        address.city,
        address.province,
        address.postalCode,
      ]
        .filter(Boolean)
        .join(', '),
      courier: `${order.courier} ${order.courierService}`,
    },
    products: mapOrderItems(order.items),
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
 * Validates an admin/seller fulfilment update against the current order and
 * returns the Prisma update. Status only moves forward, and an order can't be
 * shipped or delivered without a tracking number.
 */
export function buildFulfilmentUpdate(
  existing: {
    orderStatus: string;
    paymentStatus: string;
    trackingNumber: string | null;
  },
  data: { orderStatus?: OrderStatus; trackingNumber?: string | null },
): Prisma.OrderUpdateInput {
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

  const currentStep = FULFILMENT_STEPS.indexOf(
    existing.orderStatus as OrderStatus,
  );
  const nextStatus = data.orderStatus ?? (existing.orderStatus as OrderStatus);
  const nextStep = FULFILMENT_STEPS.indexOf(nextStatus);

  if (data.orderStatus !== undefined) {
    if (nextStep <= 0) {
      throw new ApiError(
        'Status pesanan hanya dapat diubah ke Pengemasan, Dikirim, atau Diterima',
        400,
      );
    }
    if (nextStep < currentStep) {
      throw new ApiError('Status pesanan tidak dapat dimundurkan', 400);
    }
  }

  const trackingNumber =
    data.trackingNumber === undefined
      ? undefined
      : data.trackingNumber?.trim() || null;
  const effectiveTracking =
    trackingNumber === undefined ? existing.trackingNumber : trackingNumber;

  if (
    nextStep >= FULFILMENT_STEPS.indexOf(OrderStatus.shipped) &&
    !effectiveTracking
  ) {
    throw new ApiError(
      'Nomor resi wajib diisi untuk pesanan yang dikirim',
      400,
    );
  }

  const update: Prisma.OrderUpdateInput = {
    orderStatus: data.orderStatus,
    trackingNumber,
  };
  const now = new Date();
  if (data.orderStatus === OrderStatus.shipped) update.shippedAt = now;
  if (data.orderStatus === OrderStatus.delivered) update.deliveredAt = now;
  return update;
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
  order: { id: string; orderStatus: string; paymentStatus: string },
  reason: 'user_cancelled' | 'expired' | 'failed',
) {
  if (
    order.orderStatus !== OrderStatus.pending ||
    order.paymentStatus !== PaymentStatus.unpaid
  ) {
    return false;
  }

  return orderRepository.cancelOrderAndRestoreStock(
    order.id,
    reason === 'expired'
      ? PaymentTransactionStatus.expired
      : PaymentTransactionStatus.failed,
    reason === 'expired' ? new Date() : undefined,
  );
}

/**
 * Cancels orders whose payment window has passed. The Midtrans `expire`
 * webhook normally does this; this catches the ones it missed.
 */
export async function reconcileExpiredOrders(userId?: string) {
  const expiredOrders = await orderRepository.findExpiredPendingOrders(
    new Date(),
    userId,
  );

  for (const order of expiredOrders) {
    try {
      // The webhook may be late or lost (e.g. it can't reach localhost), so
      // ask Midtrans before cancelling: the buyer may have paid already.
      const status = await getMidtransTransactionStatus(order.id);
      const txStatus = status?.transaction_status;

      if (txStatus === 'settlement' || txStatus === 'capture') {
        await paymentService.handleNotification(
          midtransNotificationSchema.parse(status),
        );
        continue;
      }

      const cancelled = await cancelOrderAndRestoreStock(order, 'expired');
      // Still open at Midtrans: close it so it can't be paid after cancelling.
      if (cancelled && txStatus === 'pending') {
        await expireMidtransTransaction(order.id).catch((error) => {
          logger.warn('Could not expire Midtrans transaction', {
            orderId: order.id,
            error,
          });
        });
      }
    } catch (error) {
      // Payment state unknown (Midtrans unreachable): keep the order pending
      // and retry on the next call rather than cancel a possibly paid order.
      logError(error, { action: 'reconcileExpiredOrders', orderId: order.id });
    }
  }
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

    const formattedOrders = orders.map((order) => {
      const uiStatus = mapToUiOrderStatus(order);
      const paymentDeadlineAt =
        uiStatus === 'Menunggu Bayar' ? getPaymentDeadlineAt(order) : null;

      return {
        orderId: order.id,
        id: order.orderNumber || order.id,
        date: formatOrderDate(order.createdAt),
        totalPrice: formatIDR(Number(order.totalAmount)),
        status: uiStatus,
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: mapToPaymentStatusLabel(order.paymentStatus),
        paymentDeadlineAt: paymentDeadlineAt?.toISOString() ?? null,
        canCancel: canCancelPendingOrder(order),
        products: mapOrderItems(order.items),
        actions: ['Detail'] as 'Detail'[],
      };
    });

    return {
      data: formattedOrders,
      meta: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
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

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: formatOrderDate(order.createdAt),
      orderStatus: mapToUiOrderStatus(order),
      paymentStatus: order.paymentStatus,
      paymentStatusLabel: mapToPaymentStatusLabel(order.paymentStatus),
      paymentMethod: formatPaymentMethod(order.paymentMethod),
      paymentDeadlineAt: paymentDeadlineAt?.toISOString() ?? null,
      canCancel: canCancelPendingOrder(order),
      totals: {
        subtotal: formatIDR(Number(order.subtotal)),
        shippingCost: formatIDR(Number(order.shippingCost)),
        serviceFee: formatIDR(Number(order.serviceFee)),
        totalAmount: formatIDR(Number(order.totalAmount)),
      },
      products: mapOrderItems(order.items),
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

    const cancelled = await cancelOrderAndRestoreStock(order, 'user_cancelled');

    // Close the Midtrans transaction too, or the buyer could still pay it.
    if (cancelled) {
      await expireMidtransTransaction(order.id).catch((error) => {
        logger.warn('Could not expire Midtrans transaction', {
          orderId: order.id,
          error,
        });
      });
    }

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
};
