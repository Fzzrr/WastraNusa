import { withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import {
  productStatusSchema,
  updateProductSchema,
} from '@/schemas/product.schema';
import { sellerProductService } from '@/services/sellerProduct.service';

type Params = { id: string };

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

// PATCH /api/seller/products/[id] — show or hide the product in the catalog
export const PATCH = withApiSeller<Params>(async ({ req, params, userId }) => {
  const { status } = productStatusSchema.parse(await req.json());
  const product = await sellerProductService.setStatus(
    userId,
    params.id,
    status,
  );
  return jsend.success(product);
});

export const DELETE = withApiSeller<Params>(async ({ params, userId }) => {
  await sellerProductService.deleteProduct(userId, params.id);
  return jsend.success(null);
});
