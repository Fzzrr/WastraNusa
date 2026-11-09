import { ApiError } from '@/lib/error';
import { productRepository } from '@/repositories/product.repository';
import { productService } from '@/services/product.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/product.service');

const mockProductRepo = vi.mocked(productRepository);

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
  sellerId: 'seller-1',
  sold: 0,
  variants: [MOCK_VARIANT, MOCK_VARIANT_2],
  createdAt: new Date('2025-12-01'),
  updatedAt: new Date('2026-01-01'),
};

beforeEach(() => {
  vi.clearAllMocks();

  mockProductRepo.countAll.mockResolvedValue(0);
  mockProductRepo.countByClothingType.mockResolvedValue([] as never);
  mockProductRepo.countByIsland.mockResolvedValue([] as never);
  mockProductRepo.countBySize.mockResolvedValue([] as never);
  mockProductRepo.countByGender.mockResolvedValue([] as never);
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

    it('should 404 a deactivated product', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue({
        ...MOCK_PRODUCT_RAW,
        status: 'inactive',
      } as never);

      await expect(
        productService.getProductDetail('prod-1'),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should 404 a product without a seller', async () => {
      mockProductRepo.findByIdOrSlug.mockResolvedValue({
        ...MOCK_PRODUCT_RAW,
        sellerId: null,
      } as never);

      await expect(
        productService.getProductDetail('prod-1'),
      ).rejects.toMatchObject({ status: 404 });
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

  // ── updateProduct ────────────────────────────────────────────────────────────

  // ── deleteProduct ────────────────────────────────────────────────────────────
});
