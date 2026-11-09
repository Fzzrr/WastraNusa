import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { productService } from '@/services/product.service';

export const GET = withApiPublic<{ id: string }>(async ({ params }) => {
  const product = await productService.getProductDetail(params.id);
  return jsend.success(product);
});
