import { getPagination, withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { createProductSchema } from '@/schemas/product.schema';
import { sellerProductService } from '@/services/sellerProduct.service';

export const GET = withApiSeller(async ({ req, userId }) => {
  const { page, limit } = getPagination(req);

  const products = await sellerProductService.getProducts(userId, page, limit);
  return jsend.success(products);
});

export const POST = withApiSeller(async ({ req, userId }) => {
  const body = await req.json();
  const data = createProductSchema.parse(body);
  const product = await sellerProductService.createProduct(userId, data);
  return jsend.success(product, 201);
});
