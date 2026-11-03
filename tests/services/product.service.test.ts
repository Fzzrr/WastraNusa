import { ApiError } from '@/lib/error';
import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import { productService } from '@/services/product.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/product.service');

const mockProductRepo = vi.mocked(productRepository);
const mockArticleRepo = vi.mocked(articleRepository);

// ─── Shared mock shapes ────────────────────────────────────────────────────────

const MOCK_VARIANT = {
  id: 'variant-1',
  name: 'Size L',
  type: 'size' as const,
  price: { toNumber: () => 250000 },
  stock: 20,
  sku: 'BPK-L',
};

const MOCK_VARIANT_2 = {
  id: 'variant-2',
  name: 'Size XL',
  type: 'size' as const,
  price: { toNumber: () => 275000 },
  stock: 10,
  sku: 'BPK-XL',
};

const MOCK_PRODUCT_RAW = {
  id: 'prod-1',
  articleId: 'article-1',
  article: { title: 'Batik Pekalongan' },
  name: 'Premium Batik Shirt',
  slug: 'premium-batik-shirt',
  description: 'A nice shirt.',
  price: { toNumber: () => 250000 },
  sku: 'BPK-001',
  weight: 300,
  island: 'Jawa',
  province: 'Jawa Tengah',
  clothingType: 'batik',
  gender: 'male' as const,
  status: 'active' as const,
  sold: 0,
  variants: [MOCK_VARIANT, MOCK_VARIANT_2],
  createdAt: new Date('2025-12-01'),
  updatedAt: new Date('2026-01-01'),
};

const MOCK_ARTICLE = {
  id: 'article-1',
  island: 'Jawa',
  province: 'Jawa Tengah',
};

beforeEach(() => {
  vi.clearAllMocks();

  mockProductRepo.countAll.mockResolvedValue(0);
  mockProductRepo.countByClothingType.mockResolvedValue([] as never);
  mockProductRepo.countByIsland.mockResolvedValue([] as never);
  mockProductRepo.countBySize.mockResolvedValue([] as never);
  mockProductRepo.countByGender.mockResolvedValue([] as never);
  mockProductRepo.countByStatus.mockResolvedValue([] as never);
  mockProductRepo.getPriceRange.mockResolvedValue({ min: 0, max: 0 });
});

describe('productService', { tags: ['backend'] }, () => {
  // ── getProducts ──────────────────────────────────────────────────────────────

  describe('getProducts', () => {
    it('should return paginated product list with mapped items', async () => {
      mockProductRepo.findAll.mockResolvedValue([MOCK_PRODUCT_RAW] as never);
      mockProductRepo.countAll.mockResolvedValue(1);

      const result = await productService.getProducts(1, 10);

      expect(mockProductRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
          limit: 10,
        }),
      );
      expect(mockProductRepo.countAll).toHaveBeenCalledTimes(2);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('prod-1');
      expect(result.items[0].price).toBe(250000);
      expect(result.items[0].stock).toBe(30);
      expect(result.items[0].variantCount).toBe(2);
      expect(result.items[0].createdAt).toBe(
        MOCK_PRODUCT_RAW.createdAt.toISOString(),
      );
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should pass the trimmed search query to the repository', async () => {
      mockProductRepo.findAll.mockResolvedValue([]);
      mockProductRepo.countAll.mockResolvedValue(0);

      await productService.getProducts(1, 10, { q: '  songket ' });

      expect(mockProductRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ q: 'songket' }),
        }),
      );
    });

    it('should clamp limit to max 50', async () => {
      mockProductRepo.findAll.mockResolvedValue([]);
      mockProductRepo.countAll.mockResolvedValue(0);

      await productService.getProducts(1, 200);

      expect(mockProductRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
          limit: 50,
        }),
      );
    });

    it('should default to page 1 and limit 10 when called with no arguments', async () => {
      mockProductRepo.findAll.mockResolvedValue([]);
      mockProductRepo.countAll.mockResolvedValue(0);

      await productService.getProducts();

      expect(mockProductRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
          limit: 10,
        }),
      );
    });

    it('should compute correct offset for page 2', async () => {
      mockProductRepo.findAll.mockResolvedValue([]);
      mockProductRepo.countAll.mockResolvedValue(0);

      await productService.getProducts(2, 5);

      expect(mockProductRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 5,
          limit: 5,
        }),
      );
    });

    it('should map article title and variant count correctly', async () => {
      const rawWithNoArticle = {
        ...MOCK_PRODUCT_RAW,
        article: null,
        variants: [],
      };
      mockProductRepo.findAll.mockResolvedValue([rawWithNoArticle] as never);
      mockProductRepo.countAll.mockResolvedValue(1);

      const result = await productService.getProducts(1, 10);

      expect(result.items[0].articleTitle).toBe('-');
      expect(result.items[0].variantCount).toBe(0);
    });
  });

  // ── getProductDetail ─────────────────────────────────────────────────────────

  describe('getProductDetail', () => {
    it('should return mapped product detail', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PRODUCT_RAW as never,
      );

      const result = await productService.getProductDetail('prod-1');

      expect(mockProductRepo.findByIdOrSlug).toHaveBeenCalledWith('prod-1');
      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('Premium Batik Shirt');
      expect(result.variants).toHaveLength(2);
      expect(result.variants[0]?.price).toBe(250000);
      expect(result.variants[1]?.price).toBe(275000);
    });

    it('should accept slug as identifier', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PRODUCT_RAW as never,
      );

      const result = await productService.getProductDetail(
        'premium-batik-shirt',
      );

      expect(mockProductRepo.findByIdOrSlug).toHaveBeenCalledWith(
        'premium-batik-shirt',
      );
      expect(result.slug).toBe('premium-batik-shirt');
    });

    it('should throw ApiError(404) when product not found', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(null);

      await expect(
        productService.getProductDetail('nonexistent'),
      ).rejects.toThrow(ApiError);

      await expect(
        productService.getProductDetail('nonexistent'),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── createProduct ────────────────────────────────────────────────────────────

  describe('getDashboardOverview', () => {
    it('should return total products and low stock items', async () => {
      mockProductRepo.countAll.mockResolvedValue(12);
      mockProductRepo.countCreatedSince
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(7);
      mockProductRepo.countLowStock.mockResolvedValue(5);
      mockProductRepo.countOutOfStock.mockResolvedValue(1);
      mockProductRepo.findLowStock.mockResolvedValue([
        {
          name: 'Batik Premium',
          clothingType: 'Batik',
          stock: 0,
          status: 'out_of_stock',
        },
        {
          name: 'Tenun Sumba',
          clothingType: 'Tenun',
          stock: 3,
          status: 'active',
        },
      ] as never);

      const result = await productService.getDashboardOverview();

      expect(mockProductRepo.countAll).toHaveBeenCalledWith();
      expect(mockProductRepo.countCreatedSince).toHaveBeenCalledTimes(2);
      expect(mockProductRepo.countLowStock).toHaveBeenCalledWith(20);
      expect(mockProductRepo.countOutOfStock).toHaveBeenCalledWith();
      expect(mockProductRepo.findLowStock).toHaveBeenCalledWith(20, 6);
      expect(result).toEqual({
        totalProducts: 12,
        weeklyDelta: 2,
        monthlyDelta: 7,
        lowStockCount: 5,
        outOfStockCount: 1,
        lowStockItems: [
          {
            name: 'Batik Premium',
            category: 'Batik',
            stock: 0,
            severity: 'out',
          },
          {
            name: 'Tenun Sumba',
            category: 'Tenun',
            stock: 3,
            severity: 'low',
          },
        ],
      });
    });
  });

  describe('createProduct', () => {
    const validInput = {
      articleId: 'article-1',
      name: 'New Batik Shirt',
      slug: 'new-batik-shirt',
      price: 200000,
      sku: 'NEW-001',
      weight: 300,
      clothingType: 'batik',
      gender: 'male' as const,
      variants: [
        {
          name: 'Size M',
          type: 'size' as const,
          price: 175000,
          stock: 5,
          sku: 'VAR-M',
        },
      ],
    };

    it('should create a product and return mapped output', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(MOCK_ARTICLE as never);
      mockProductRepo.create.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      const result = await productService.createProduct(validInput);

      expect(mockArticleRepo.findByIdOrSlug).toHaveBeenCalledWith('article-1');
      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          articleId: 'article-1',
          name: 'New Batik Shirt',
          island: 'Jawa',
          province: 'Jawa Tengah',
        }),
      );
      expect(result.id).toBe('prod-1');
    });

    it('should use provided slug when given', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(MOCK_ARTICLE as never);
      mockProductRepo.create.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      await productService.createProduct({
        ...validInput,
        slug: 'custom-slug',
      });

      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'custom-slug' }),
      );
    });

    it('should throw ApiError(404) when article is not found', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(null);

      await expect(
        productService.createProduct(validInput),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should throw ApiError(400) when article has no island/province', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue({
        id: 'article-1',
        island: '',
        province: '',
      } as never);

      await expect(
        productService.createProduct(validInput),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should default status to active when not provided', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(MOCK_ARTICLE as never);
      mockProductRepo.create.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      await productService.createProduct(validInput);

      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      );
    });

    it('should persist variant price as the direct variant price', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(MOCK_ARTICLE as never);
      mockProductRepo.create.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      await productService.createProduct({
        ...validInput,
        variants: [
          {
            name: 'Size M',
            type: 'size',
            price: 175000,
            stock: 5,
            sku: 'VAR-M',
          },
        ],
      });

      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: {
            create: [
              expect.objectContaining({
                price: 175000,
              }),
            ],
          },
        }),
      );
    });
  });

  // ── updateProduct ────────────────────────────────────────────────────────────

  describe('updateProduct', () => {
    it('should update a product and return mapped output', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PRODUCT_RAW as never,
      );
      mockProductRepo.update.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      const result = await productService.updateProduct('prod-1', {
        slug: 'premium-batik-shirt',
        name: 'Updated Batik Shirt',
        variants: [],
      });

      expect(mockProductRepo.findByIdOrSlug).toHaveBeenCalledWith('prod-1');
      expect(mockProductRepo.update).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining({ name: 'Updated Batik Shirt' }),
      );
      expect(result).toBeDefined();
    });

    it('should validate new articleId if provided', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PRODUCT_RAW as never,
      );
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(null);

      await expect(
        productService.updateProduct('prod-1', {
          slug: 'premium-batik-shirt',
          articleId: 'nonexistent',
          variants: [],
        }),
      ).rejects.toMatchObject({ status: 404 });

      expect(mockArticleRepo.findByIdOrSlug).toHaveBeenCalledWith(
        'nonexistent',
      );
    });

    it('should not call articleRepository when articleId is not in update payload', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PRODUCT_RAW as never,
      );
      mockProductRepo.update.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      await productService.updateProduct('prod-1', {
        slug: 'premium-batik-shirt',
        name: 'No Article Change',
        variants: [],
      });

      expect(mockArticleRepo.findByIdOrSlug).not.toHaveBeenCalled();
    });

    it('should update variant price as the direct variant price', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PRODUCT_RAW as never,
      );
      mockProductRepo.update.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      await productService.updateProduct('prod-1', {
        slug: 'premium-batik-shirt',
        variants: [
          {
            id: 'variant-1',
            name: 'Size L',
            type: 'size',
            price: 310000,
            stock: 8,
            sku: 'BPK-L',
          },
        ],
      });

      expect(mockProductRepo.update).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining({
          variants: {
            deleteMany: {},
            create: [
              expect.objectContaining({
                price: 310000,
              }),
            ],
          },
        }),
      );
    });

    it('should throw ApiError(404) when product not found', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue(null);

      await expect(
        productService.updateProduct('nonexistent', {
          slug: 'premium-batik-shirt',
          name: 'X',
          variants: [],
        }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── deleteProduct ────────────────────────────────────────────────────────────

  describe('deleteProduct', () => {
    it('should call repository delete and return deleted product', async () => {
      mockProductRepo.delete.mockResolvedValue(MOCK_PRODUCT_RAW as never);

      const result = await productService.deleteProduct('prod-1');

      expect(mockProductRepo.delete).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual(MOCK_PRODUCT_RAW);
    });
  });
});
