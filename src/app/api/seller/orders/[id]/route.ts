import { withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { adminOrderUpdateSchema } from '@/schemas/order.schema';
import { sellerOrderService } from '@/services/sellerOrder.service';

type Params = { id: string };

export const PUT = withApiSeller<Params>(async ({ req, params, userId }) => {
  const body = await req.json();
  const payload = adminOrderUpdateSchema.parse(body);
  const order = await sellerOrderService.updateOrderForSeller(
    userId,
    params.id,
    payload,
  );
  return jsend.success(order);
});
