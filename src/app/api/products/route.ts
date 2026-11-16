import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { parseCatalogQuery, productService } from '@/services/product.service';

export const GET = withApiPublic(async ({ req }) => {
  const { page, limit, filters } = parseCatalogQuery(
    new URL(req.url).searchParams,
  );
  const products = await productService.getProducts(page, limit, filters);
  return jsend.success(products);
});
