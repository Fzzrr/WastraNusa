import { ProductStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { articleRepository } from '@/repositories/article.repository';
import { sellerProductRepository } from '@/repositories/sellerProduct.repository';
import {
  type CreateProductInput,
  type ProductVariantInput,
  type UpdateProductInput,
} from '@/schemas/product.schema';
import {
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

const sumVariantStock = (variants: Array<{ stock: number }>) =>
  variants.reduce((total, variant) => total + variant.stock, 0);

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

/**
 * Business logic for a seller managing their OWN products. `sellerId` is the
 * authenticated seller's user id (from `withApiSeller`); it scopes every read
 * and is enforced before every mutation.
 */
export const sellerProductService = {
  getProducts: async (
    sellerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ProductInventoryListResponse> => {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const [products, totalItems] = await Promise.all([
      sellerProductRepository.findAllBySeller({
        sellerId,
        offset,
        limit: safeLimit,
      }),
      sellerProductRepository.countBySeller(sellerId),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return {
      items: products.map(mapProduct),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
      },
    };
  },

  getProductDetail: async (
    sellerId: string,
    idOrSlug: string,
  ): Promise<ProductInventoryItem> => {
    const product = await sellerProductRepository.findByIdOrSlugForSeller(
      sellerId,
      idOrSlug,
    );
    if (!product) {
      throw new ApiError('Produk tidak ditemukan', 404);
    }

    return mapProduct(product);
  },

  createProduct: async (
    sellerId: string,
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

    const product = await sellerProductRepository.create({
      id: crypto.randomUUID(),
      articleId: data.articleId,
      sellerId,
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

    logger.info('Seller product created successfully', {
      productId: product.id,
      sellerId,
    });
    return mapProduct(product);
  },

  updateProduct: async (
    sellerId: string,
    idOrSlug: string,
    data: UpdateProductInput,
  ): Promise<ProductInventoryItem> => {
    const existing = await sellerProductRepository.findByIdOrSlugForSeller(
      sellerId,
      idOrSlug,
    );
    if (!existing) {
      throw new ApiError('Produk tidak ditemukan', 404);
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

    const product = await sellerProductRepository.update(existing.id, {
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

    logger.info('Seller product updated successfully', {
      productId: existing.id,
      sellerId,
    });
    return mapProduct(product);
  },

  deleteProduct: async (sellerId: string, idOrSlug: string) => {
    const ownedId = await sellerProductRepository.resolveOwnedProductId(
      sellerId,
      idOrSlug,
    );
    if (!ownedId) {
      throw new ApiError('Produk tidak ditemukan', 404);
    }

    const product = await sellerProductRepository.delete(ownedId);
    logger.info('Seller product deleted successfully', {
      productId: product.id,
      sellerId,
    });
    return product;
  },
};
