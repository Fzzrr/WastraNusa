import { ProductStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { isForSale } from '@/lib/product-availability';
import { mergeUniqueSorted } from '@/lib/utils';
import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import {
  type ProductCatalogFilters,
  type ProductCatalogSortBy,
  type ProductFilterOption,
  type ProductInventoryItem,
  type ProductInventoryListResponse,
} from '@/types/product';

const mapVariant = (variant: {
  id: string;
  name: string;
  type: 'size' | 'color';
  price: { toNumber(): number } | null;
  stock: number;
  sku: string;
  imageURL: string | null;
}) => ({
  id: variant.id,
  name: variant.name,
  type: variant.type,
  price: variant.price ? variant.price.toNumber() : null,
  stock: variant.stock,
  sku: variant.sku,
  imageURL: variant.imageURL,
});

const sumVariantStock = (
  variants: Array<{
    stock: number;
  }>,
) => variants.reduce((total, variant) => total + variant.stock, 0);

const mapProduct = (product: {
  id: string;
  articleId: string;
  article: { title: string } | null;
  name: string;
  slug: string;
  description: string | null;
  price: { toNumber(): number };
  sku: string;
  weight: number;
  imageURL: string | null;
  island?: string | null;
  province: string;
  clothingType: string;
  gender: 'male' | 'female' | 'unisex' | null;
  status: ProductStatus;
  sold: number;
  seller?: {
    id: string;
    name: string;
    shopProfile: { shopName: string } | null;
  } | null;
  variants: {
    id: string;
    name: string;
    type: 'size' | 'color';
    price: { toNumber(): number } | null;
    stock: number;
    sku: string;
    imageURL: string | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
}): ProductInventoryItem => ({
  id: product.id,
  articleId: product.articleId,
  articleTitle: product.article?.title ?? '-',
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price.toNumber(),
  stock: sumVariantStock(product.variants),
  sku: product.sku,
  weight: product.weight,
  imageURL: product.imageURL,
  island: product.island ?? '',
  province: product.province,
  clothingType: product.clothingType,
  gender: product.gender,
  status: product.status,
  sold: product.sold,
  variants: product.variants.map(mapVariant),
  variantCount: product.variants.length,
  seller: product.seller
    ? {
        id: product.seller.id,
        name: product.seller.name,
        shopName: product.seller.shopProfile?.shopName ?? null,
      }
    : null,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

export { mapProduct };

const PRODUCT_SORT_OPTIONS: readonly ProductCatalogSortBy[] = [
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
];

const normalizeFilters = (
  filters: ProductCatalogFilters = {},
): ProductCatalogFilters => {
  const minPrice =
    typeof filters.minPrice === 'number' && Number.isFinite(filters.minPrice)
      ? Math.max(0, filters.minPrice)
      : undefined;
  const maxPrice =
    typeof filters.maxPrice === 'number' && Number.isFinite(filters.maxPrice)
      ? Math.max(0, filters.maxPrice)
      : undefined;

  const normalizedMinPrice =
    typeof minPrice === 'number' &&
    typeof maxPrice === 'number' &&
    minPrice > maxPrice
      ? maxPrice
      : minPrice;
  const normalizedMaxPrice =
    typeof minPrice === 'number' &&
    typeof maxPrice === 'number' &&
    minPrice > maxPrice
      ? minPrice
      : maxPrice;

  return {
    minPrice: normalizedMinPrice,
    maxPrice: normalizedMaxPrice,
    island: filters.island?.trim() || undefined,
    size: filters.size?.trim() || undefined,
    clothingType: filters.clothingType?.trim() || undefined,
    q: filters.q?.trim() || undefined,
    gender: filters.gender,
    inStock: typeof filters.inStock === 'boolean' ? filters.inStock : undefined,
    excludeOutOfStock:
      typeof filters.excludeOutOfStock === 'boolean'
        ? filters.excludeOutOfStock
        : undefined,
    sortBy: PRODUCT_SORT_OPTIONS.includes(filters.sortBy ?? 'newest')
      ? (filters.sortBy ?? 'newest')
      : 'newest',
  };
};

const withFilterOmitted = <K extends keyof ProductCatalogFilters>(
  filters: ProductCatalogFilters,
  key: K,
): Omit<ProductCatalogFilters, K> => {
  const clonedFilters = { ...filters };
  delete clonedFilters[key];
  return clonedFilters;
};

const mapFilterOptions = (
  data: Array<{ name: string; count: number }>,
  activeName?: string,
): ProductFilterOption[] =>
  data.map((item) => ({
    name: item.name,
    count: item.count,
    active: item.name === activeName,
  }));

export const productService = {
  getProducts: async (
    page: number = 1,
    limit: number = 10,
    filters: ProductCatalogFilters = {},
  ): Promise<ProductInventoryListResponse> => {
    const normalizedFilters = normalizeFilters(filters);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const filtersWithoutCategory = withFilterOmitted(
      normalizedFilters,
      'clothingType',
    );
    const filtersWithoutIsland = withFilterOmitted(normalizedFilters, 'island');
    const filtersWithoutSize = withFilterOmitted(normalizedFilters, 'size');
    const filtersWithoutGender = withFilterOmitted(normalizedFilters, 'gender');
    // Headline totals ignore the shopper's filters but match what the list
    // can show (out-of-stock products are hidden by default).
    const catalogBase: ProductCatalogFilters = {
      excludeOutOfStock: normalizedFilters.excludeOutOfStock,
    };
    const filtersWithoutPrice = withFilterOmitted(
      withFilterOmitted(normalizedFilters, 'minPrice'),
      'maxPrice',
    );

    const [
      products,
      totalItems,
      globalTotalItems,
      categoryCounts,
      islandCounts,
      sizeCounts,
      genderCounts,
      priceRange,
      globalCategoryCounts,
      globalIslandCounts,
    ] = await Promise.all([
      productRepository.findAll({
        offset,
        limit: safeLimit,
        filters: normalizedFilters,
      }),
      productRepository.countAll(normalizedFilters),
      productRepository.countAll(catalogBase),
      productRepository.countByClothingType(filtersWithoutCategory),
      productRepository.countByIsland(filtersWithoutIsland),
      productRepository.countBySize(filtersWithoutSize),
      productRepository.countByGender(filtersWithoutGender),
      productRepository.getPriceRange(filtersWithoutPrice),
      productRepository.countByClothingType(catalogBase),
      productRepository.countByIsland(catalogBase),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    const categories = mapFilterOptions(
      categoryCounts.map((item) => ({
        name: item.clothingType,
        count: item._count.clothingType,
      })),
      normalizedFilters.clothingType,
    );

    const islands = mapFilterOptions(
      islandCounts.map((item) => ({
        name: item.island,
        count: item._count.island,
      })),
      normalizedFilters.island,
    );

    const genders = mapFilterOptions(
      genderCounts
        .filter((item): item is typeof item & { gender: string } =>
          Boolean(item.gender),
        )
        .map((item) => ({
          name: item.gender,
          count: item._count.gender,
        })),
      normalizedFilters.gender,
    );

    const sizes = mapFilterOptions(
      sizeCounts.map((item) => ({
        name: item.name,
        count: item._count.name,
      })),
      normalizedFilters.size,
    );

    return {
      items: products.map(mapProduct),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        categories,
        islands,
        sizes,
        genders,
        priceRange,
        stats: {
          totalProducts: globalTotalItems,
          totalCategories: globalCategoryCounts.length,
          totalIslands: globalIslandCounts.length,
        },
      },
    };
  },

  getProductDetail: async (idOrSlug: string): Promise<ProductInventoryItem> => {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product || !isForSale(product)) {
      throw new ApiError('Produk tidak ditemukan', 404);
    }

    return mapProduct(product);
  },

  /** Clothing types used anywhere — every seller's products and articles. */
  getClothingTypes: async (): Promise<string[]> => {
    const [productTypes, articleOptions] = await Promise.all([
      productRepository.getDistinctClothingTypes(),
      articleRepository.getFieldOptions(),
    ]);
    return mergeUniqueSorted(productTypes, articleOptions.clothingTypes);
  },
};
