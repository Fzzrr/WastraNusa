import { OrderStatus, PaymentStatus } from '@/generated/prisma/enums';
import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { orderService } from '@/services/order.service';

/**
 * @deprecated Admin-wide orders (pesanan) endpoint. Superseded by
 * `/api/seller/orders`. Kept functional for backward compatibility; the admin
 * pesanan UI has been retired.
 */
export const GET = withApiAdmin(async ({ req }) => {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.max(1, Number(url.searchParams.get('limit')) || 10);

  const orderStatusParam = url.searchParams.get('orderStatus');
  const paymentStatusParam = url.searchParams.get('paymentStatus');

  const orderStatus = Object.values(OrderStatus).includes(
    orderStatusParam as OrderStatus,
  )
    ? (orderStatusParam as OrderStatus)
    : undefined;
  const paymentStatus = Object.values(PaymentStatus).includes(
    paymentStatusParam as PaymentStatus,
  )
    ? (paymentStatusParam as PaymentStatus)
    : undefined;

  const orders = await orderService.getAdminOrders(page, limit, {
    orderStatus,
    paymentStatus,
  });
  return jsend.success(orders);
});
