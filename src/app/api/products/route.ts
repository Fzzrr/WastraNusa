import { Gender } from '@/generated/prisma/enums';
import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
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
  const q = url.searchParams.get('q') || undefined;

  const rawGender = url.searchParams.get('gender');
  const gender =
    rawGender && rawGender in Gender ? (rawGender as Gender) : undefined;

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
    q,
    gender,
    inStock,
    excludeOutOfStock: !includeOutOfStock,
    sortBy,
  });
  return jsend.success(products);
});
