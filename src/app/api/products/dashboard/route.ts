import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { productService } from '@/services/product.service';

/**
 * @deprecated Admin product-inventory dashboard endpoint. Superseded by the
 * seller-scoped dashboard (`/api/seller/dashboard`). Kept functional for
 * backward compatibility; the admin product-inventory UI has been retired.
 */
export const GET = withApiPublic(async () => {
  const dashboardOverview = await productService.getDashboardOverview();
  return jsend.success(dashboardOverview);
});
