import { OrderStatus, PaymentStatus } from '@/generated/prisma/enums';
import { type SellerOrderItem } from '@/hooks/use-seller-order';

export type FilterOrderStatus = OrderStatus | 'all';

export type FilterPaymentStatus = PaymentStatus | 'all';

export type OrderDraft = {
  orderStatus: OrderStatus;
  trackingNumber: string;
};

export const ORDER_STATUS_FILTER_OPTIONS: {
  value: OrderStatus;
  label: string;
}[] = [
  { value: OrderStatus.pending, label: 'Menunggu Bayar' },
  { value: OrderStatus.confirmed, label: 'Dikonfirmasi' },
  { value: OrderStatus.processing, label: 'Pengemasan' },
  { value: OrderStatus.shipped, label: 'Dikirim' },
  { value: OrderStatus.delivered, label: 'Diterima' },
  { value: OrderStatus.cancelled, label: 'Dibatalkan' },
];

export const ORDER_STATUS_EDIT_OPTIONS: {
  value: OrderStatus;
  label: string;
}[] = [
  { value: OrderStatus.processing, label: 'Pengemasan' },
  { value: OrderStatus.shipped, label: 'Dikirim' },
  { value: OrderStatus.delivered, label: 'Diterima' },
];

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] =
  [
    { value: PaymentStatus.unpaid, label: 'Belum Bayar' },
    { value: PaymentStatus.paid, label: 'Lunas' },
    { value: PaymentStatus.failed, label: 'Gagal' },
    { value: PaymentStatus.refunded, label: 'Refund' },
  ];

export function getOrderStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case OrderStatus.delivered:
      return 'bg-emerald-100 text-emerald-700';
    case OrderStatus.shipped:
      return 'bg-blue-100 text-blue-700';
    case OrderStatus.processing:
      return 'bg-amber-100 text-amber-700';
    case OrderStatus.confirmed:
      return 'bg-sky-100 text-sky-700';
    case OrderStatus.cancelled:
      return 'bg-red-100 text-red-700';
    case OrderStatus.pending:
    default:
      return 'bg-muted text-foreground';
  }
}

export function getPaymentStatusBadgeClass(status: PaymentStatus) {
  switch (status) {
    case PaymentStatus.paid:
      return 'bg-emerald-100 text-emerald-700';
    case PaymentStatus.failed:
      return 'bg-red-100 text-red-700';
    case PaymentStatus.refunded:
      return 'bg-orange-100 text-orange-700';
    case PaymentStatus.unpaid:
    default:
      return 'bg-muted text-foreground';
  }
}

export function getOrderDraft(
  order: SellerOrderItem,
  draft?: OrderDraft,
): OrderDraft {
  if (draft) return draft;
  return {
    orderStatus: order.orderStatus,
    trackingNumber: order.trackingNumber ?? '',
  };
}

export function isOrderEditable(order: SellerOrderItem) {
  if (order.paymentStatus !== PaymentStatus.paid) {
    return false;
  }
  if (order.orderStatus === OrderStatus.cancelled) {
    return false;
  }
  return true;
}

export function isEditableTargetStatus(
  status: OrderStatus,
): status is 'processing' | 'shipped' | 'delivered' {
  return (
    status === OrderStatus.processing ||
    status === OrderStatus.shipped ||
    status === OrderStatus.delivered
  );
}
