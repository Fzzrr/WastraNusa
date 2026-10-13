import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { publicShopService } from '@/services/publicShop.service';

export const GET = withApiPublic<{ sellerId: string }>(async ({ params }) => {
  const shop = await publicShopService.getPublicShop(params.sellerId);
  return jsend.success(shop);
});
