import { articleRepository } from '@/repositories/article.repository';
import { sellerProductRepository } from '@/repositories/sellerProduct.repository';
import { sellerProductService } from '@/services/sellerProduct.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/sellerProduct.repository', () => ({
  sellerProductRepository: {
    findAllBySeller: vi.fn(),
    countBySeller: vi.fn(),
    resolveOwnedProductId: vi.fn(),
    findByIdOrSlugForSeller: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findVariantsInUnpaidOrders: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockRepo = vi.mocked(sellerProductRepository);
const mockArticleRepo = vi.mocked(articleRepository);

const SELLER_ID = 'seller-1';

beforeEach(() => {
  vi.clearAllMocks();
});

describe(
  'sellerProductService ownership scoping',
  { tags: ['backend'] },
  () => {
    it('scopes list queries to the authenticated seller', async () => {
      mockRepo.findAllBySeller.mockResolvedValue([] as never);
      mockRepo.countBySeller.mockResolvedValue(0);

      await sellerProductService.getProducts(SELLER_ID, 1, 10);

      expect(mockRepo.findAllBySeller).toHaveBeenCalledWith(
        expect.objectContaining({ sellerId: SELLER_ID }),
      );
      expect(mockRepo.countBySeller).toHaveBeenCalledWith(SELLER_ID);
    });

    it('refuses to update a product the seller does not own', async () => {
      mockRepo.findByIdOrSlugForSeller.mockResolvedValue(null as never);

      await expect(
        sellerProductService.updateProduct(SELLER_ID, 'prod-x', {
          name: 'Hijacked',
        } as never),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('refuses to delete a product the seller does not own', async () => {
      mockRepo.resolveOwnedProductId.mockResolvedValue(null as never);

      await expect(
        sellerProductService.deleteProduct(SELLER_ID, 'prod-x'),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('deletes only the owned product id resolved for the seller', async () => {
      mockRepo.resolveOwnedProductId.mockResolvedValue('prod-owned' as never);
      mockRepo.delete.mockResolvedValue({ id: 'prod-owned' } as never);

      await sellerProductService.deleteProduct(SELLER_ID, 'prod-owned');

      expect(mockRepo.resolveOwnedProductId).toHaveBeenCalledWith(
        SELLER_ID,
        'prod-owned',
      );
      expect(mockRepo.delete).toHaveBeenCalledWith('prod-owned');
    });

    it('404s creation when the source article is missing', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(null as never);

      await expect(
        sellerProductService.createProduct(SELLER_ID, {
          articleId: 'missing',
          name: 'X',
          slug: 'x',
          price: 1000,
          sku: 'X-1',
          weight: 100,
          imageURL: null,
          clothingType: 'batik',
        } as never),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  },
);

describe(
  'sellerProductService.updateProduct variants',
  { tags: ['backend'] },
  () => {
    const variant = (id: string, name: string) => ({
      id,
      name,
      type: 'size' as const,
      price: 100000,
      stock: 3,
      sku: `SKU-${id}`,
      imageURL: null,
    });
    const existing = {
      id: 'prod-1',
      articleId: 'art-1',
      variants: [variant('v-m', 'M'), variant('v-l', 'L')],
    };

    beforeEach(() => {
      mockRepo.findByIdOrSlugForSeller.mockResolvedValue(existing as never);
      mockRepo.findVariantsInUnpaidOrders.mockResolvedValue([]);
      mockRepo.update.mockResolvedValue({
        ...existing,
        article: { title: 'A' },
        name: 'P',
        slug: 'p',
        description: null,
        price: { toNumber: () => 100000 },
        sku: 'P',
        weight: 1,
        imageURL: null,
        province: 'Jawa Barat',
        clothingType: 'batik',
        gender: null,
        status: 'active',
        sold: 0,
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);
    });

    it('keeps existing variant ids so carts and orders stay linked', async () => {
      await sellerProductService.updateProduct(SELLER_ID, 'prod-1', {
        variants: [
          { ...variant('v-l', 'L'), stock: 9 },
          // An id from another product must not be reused.
          variant('v-foreign', 'XL'),
        ],
      } as never);

      const [, , variants] = mockRepo.update.mock.calls[0];
      expect(variants?.kept).toEqual([
        expect.objectContaining({ id: 'v-l', stock: 9 }),
      ]);
      expect(variants?.created).toHaveLength(1);
      expect(variants?.created[0].id).not.toBe('v-foreign');
      // Only the removed variant is checked for unpaid orders.
      expect(mockRepo.findVariantsInUnpaidOrders).toHaveBeenCalledWith(['v-m']);
    });

    it('refuses to remove a variant that is in an unpaid order', async () => {
      mockRepo.findVariantsInUnpaidOrders.mockResolvedValue([{ name: 'M' }]);

      await expect(
        sellerProductService.updateProduct(SELLER_ID, 'prod-1', {
          variants: [variant('v-l', 'L')],
        } as never),
      ).rejects.toMatchObject({ status: 409 });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  },
);
