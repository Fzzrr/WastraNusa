import { ProductStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import {
  type CreateProductInput,
  type ProductVariantInput,
  type UpdateProductInput,
} from '@/schemas/product.schema';
import { type ProductDashboardData } from '@/types/dashboard';
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
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

const PRODUCT_SORT_OPTIONS: readonly ProductCatalogSortBy[] = [
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
];

const PRODUCT_STATUS_OPTIONS: readonly ProductStatus[] = [
  ProductStatus.active,
  ProductStatus.inactive,
  ProductStatus.out_of_stock,
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
    gender: filters.gender,
    status: filters.status,
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

const normalizeVariantsForCreate = (variants?: ProductVariantInput[]) =>
  variants?.map((variant) => ({
    id: variant.id ?? crypto.randomUUID(),
    name: variant.name,
    type: variant.type,
    price: variant.price,
    stock: variant.stock,
    sku: variant.sku,
    imageURL: variant.imageURL,
  }));

const normalizeVariantsForUpdate = (variants: ProductVariantInput[]) => ({
  deleteMany: {},
  create: variants.map((variant) => ({
    id: variant.id ?? crypto.randomUUID(),
    name: variant.name,
    type: variant.type,
    price: variant.price,
    stock: variant.stock,
    sku: variant.sku,
    imageURL: variant.imageURL,
  })),
});

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
    const filtersWithoutStatus = withFilterOmitted(normalizedFilters, 'status');
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
      statusCounts,
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
      productRepository.countAll(),
      productRepository.countByClothingType(filtersWithoutCategory),
      productRepository.countByIsland(filtersWithoutIsland),
      productRepository.countBySize(filtersWithoutSize),
      productRepository.countByGender(filtersWithoutGender),
      productRepository.countByStatus(filtersWithoutStatus),
      productRepository.getPriceRange(filtersWithoutPrice),
      productRepository.countByClothingType(),
      productRepository.countByIsland(),
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

    const statusMap = new Map(
      statusCounts.map((item) => [item.status, item._count.status]),
    );
    const statuses = PRODUCT_STATUS_OPTIONS.map((status) => ({
      name: status,
      count: statusMap.get(status) ?? 0,
      active: normalizedFilters.status === status,
    }));

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
        statuses,
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
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    return mapProduct(product);
  },

  getDashboardOverview: async (): Promise<ProductDashboardData> => {
    const LOW_STOCK_THRESHOLD = 20;
    const [totalProducts, lowStockItems] = await Promise.all([
      productRepository.countAll(),
      productRepository.findLowStock(LOW_STOCK_THRESHOLD, 6),
    ]);
    // compute weekly/monthly deltas
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyDelta, monthlyDelta] = await Promise.all([
      productRepository.countCreatedSince(weekAgo),
      productRepository.countCreatedSince(monthAgo),
    ]);

    const lowStockCount =
      await productRepository.countLowStock(LOW_STOCK_THRESHOLD);
    const outOfStockCount = await productRepository.countOutOfStock();

    return {
      totalProducts,
      weeklyDelta,
      monthlyDelta,
      lowStockCount,
      outOfStockCount,
      lowStockItems: lowStockItems.map((item) => ({
        name: item.name,
        category: item.clothingType,
        stock: item.stock,
        severity:
          item.status === ProductStatus.out_of_stock || item.stock <= 0
            ? 'out'
            : 'low',
      })),
    };
  },

  createProduct: async (
    data: CreateProductInput,
  ): Promise<ProductInventoryItem> => {
    const article = await articleRepository.findByIdOrSlug(data.articleId);
    if (!article) {
      throw new ApiError('Artikel tidak ditemukan', 404);
    }
    const island = article.island?.trim();
    const province = article.province?.trim();
    if (!island || !province) {
      throw new ApiError(
        'Artikel belum memiliki data pulau/provinsi yang valid',
        400,
      );
    }

    const product = await productRepository.create({
      id: crypto.randomUUID(),
      articleId: data.articleId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      price: data.price,
      sku: data.sku,
      weight: data.weight,
      imageURL: data.imageURL,
      island,
      province,
      clothingType: data.clothingType,
      gender: data.gender ?? null,
      status: ProductStatus.active,
      variants: data.variants?.length
        ? { create: normalizeVariantsForCreate(data.variants) }
        : undefined,
    });

    logger.info('Product created successfully', { productId: product.id });
    return mapProduct(product);
  },

  updateProduct: async (
    idOrSlug: string,
    data: UpdateProductInput,
  ): Promise<ProductInventoryItem> => {
    const existing = await productRepository.findByIdOrSlug(idOrSlug);
    if (!existing) {
      throw new ApiError('Product not found', 404);
    }

    const nextArticle =
      data.articleId && data.articleId !== existing.articleId
        ? await articleRepository.findByIdOrSlug(data.articleId)
        : undefined;

    if (data.articleId && !nextArticle) {
      throw new ApiError('Artikel tidak ditemukan', 404);
    }

    const nextIsland = nextArticle?.island?.trim();
    const nextProvince = nextArticle?.province?.trim();

    if (nextArticle && (!nextIsland || !nextProvince)) {
      throw new ApiError(
        'Artikel belum memiliki data pulau/provinsi yang valid',
        400,
      );
    }

    const product = await productRepository.update(idOrSlug, {
      articleId: data.articleId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      sku: data.sku,
      weight: data.weight,
      imageURL: data.imageURL,
      island: nextIsland,
      province: nextProvince,
      clothingType: data.clothingType,
      gender: data.gender,
      variants: data.variants
        ? normalizeVariantsForUpdate(data.variants)
        : undefined,
    });

    logger.info('Product updated successfully', { productId: existing.id });
    return mapProduct(product);
  },

  deleteProduct: async (idOrSlug: string) => {
    const product = await productRepository.delete(idOrSlug);
    logger.info('Product deleted successfully', { productId: product.id });
    return product;
  },

  getClothingTypes: async (): Promise<string[]> => {
    return productRepository.getDistinctClothingTypes();
  },
};
