import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { getPagination } from '@/lib/pagination';
import { orderService } from '@/services/order.service';

export const GET = withApiAuth(async ({ req, userId }) => {
  const status = new URL(req.url).searchParams.get('status') || undefined;
  const { page, limit } = getPagination(req);

  const result = await orderService.getUserOrders(userId, status, page, limit);

  return jsend.success(result);
});
