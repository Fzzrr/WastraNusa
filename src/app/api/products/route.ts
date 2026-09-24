import { Gender, ProductStatus } from '@/generated/prisma/enums';
import { withApiAdmin, withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { createProductSchema } from '@/schemas/product.schema';
import { productService } from '@/services/product.service';
import type { ProductCatalogSortBy } from '@/types/product';

const PRODUCT_SORT_OPTIONS: readonly ProductCatalogSortBy[] = [
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
];

export const GET = withApiPublic(async ({ req }) => {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.max(1, Number(url.searchParams.get('limit')) || 10);

  const minPriceParam = url.searchParams.get('minPrice');
  const rawMinPrice =
    minPriceParam === null ? Number.NaN : Number(minPriceParam);
  const minPrice = Number.isFinite(rawMinPrice) ? rawMinPrice : undefined;

  const maxPriceParam = url.searchParams.get('maxPrice');
  const rawMaxPrice =
    maxPriceParam === null ? Number.NaN : Number(maxPriceParam);
  const maxPrice = Number.isFinite(rawMaxPrice) ? rawMaxPrice : undefined;

  const island = url.searchParams.get('island') || undefined;
  const size = url.searchParams.get('size') || undefined;
  const clothingType = url.searchParams.get('clothingType') || undefined;
  const topic = url.searchParams.get('topic') || undefined;

  const rawGender = url.searchParams.get('gender');
  const gender =
    rawGender && rawGender in Gender ? (rawGender as Gender) : undefined;

  const rawStatus = url.searchParams.get('status');
  const status =
    rawStatus && rawStatus in ProductStatus
      ? (rawStatus as ProductStatus)
      : undefined;

  const rawInStock = url.searchParams.get('inStock');
  const inStock =
    rawInStock === 'true' ? true : rawInStock === 'false' ? false : undefined;

  const includeOutOfStock =
    url.searchParams.get('includeOutOfStock') === 'true';

  const rawSortBy = url.searchParams.get('sortBy');
  const sortBy =
    rawSortBy &&
    PRODUCT_SORT_OPTIONS.includes(rawSortBy as ProductCatalogSortBy)
      ? (rawSortBy as ProductCatalogSortBy)
      : undefined;

  const products = await productService.getProducts(page, limit, {
    minPrice,
    maxPrice,
    island,
    size,
    clothingType,
    topic,
    gender,
    status,
    inStock,
    excludeOutOfStock: !includeOutOfStock,
    sortBy,
  });
  return jsend.success(products);
});

export const POST = withApiAdmin(async ({ req }) => {
  const body = await req.json();
  const data = createProductSchema.parse(body);
  const product = await productService.createProduct(data);
  return jsend.success(product, 201);
});
