import { withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { updateProductSchema } from '@/schemas/product.schema';
import { sellerProductService } from '@/services/sellerProduct.service';

type Params = { id: string };

export const GET = withApiSeller<Params>(async ({ params, userId }) => {
  const product = await sellerProductService.getProductDetail(
    userId,
    params.id,
  );
  return jsend.success(product);
});

export const PUT = withApiSeller<Params>(async ({ req, params, userId }) => {
  const body = await req.json();
  const data = updateProductSchema.parse(body);
  const product = await sellerProductService.updateProduct(
    userId,
    params.id,
    data,
  );
  return jsend.success(product);
});

export const DELETE = withApiSeller<Params>(async ({ params, userId }) => {
  await sellerProductService.deleteProduct(userId, params.id);
  return jsend.success(null);
});
