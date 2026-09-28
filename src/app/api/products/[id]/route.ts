import { withApiAdmin, withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { updateProductSchema } from '@/schemas/product.schema';
import { productService } from '@/services/product.service';

export const GET = withApiPublic<{ id: string }>(async ({ params }) => {
  const product = await productService.getProductDetail(params.id);
  return jsend.success(product);
});

/**
 * @deprecated Admin product update endpoint. Superseded by
 * `/api/seller/products/[id]`, which enforces seller ownership. Kept functional
 * for backward compatibility.
 */
export const PUT = withApiAdmin<{ id: string }>(async ({ req, params }) => {
  const body = await req.json();
  const data = updateProductSchema.parse(body);
  const product = await productService.updateProduct(params.id, data);
  return jsend.success(product);
});

/**
 * @deprecated Admin product deletion endpoint. Superseded by
 * `/api/seller/products/[id]`, which enforces seller ownership. Kept functional
 * for backward compatibility.
 */
export const DELETE = withApiAdmin<{ id: string }>(async ({ params }) => {
  await productService.deleteProduct(params.id);
  return jsend.success(null);
});
