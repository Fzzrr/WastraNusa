import { OrderStatus, PaymentStatus } from '@/generated/prisma/enums';
import { getPagination, withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sellerOrderService } from '@/services/sellerOrder.service';

export const GET = withApiSeller(async ({ req, userId }) => {
  const url = new URL(req.url);
  const { page, limit } = getPagination(req);

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

  const orders = await sellerOrderService.getSellerOrders(userId, page, limit, {
    orderStatus,
    paymentStatus,
  });
  return jsend.success(orders);
});
