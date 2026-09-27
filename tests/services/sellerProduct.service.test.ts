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

    it('404s a detail read for a product the seller does not own', async () => {
      mockRepo.findByIdOrSlugForSeller.mockResolvedValue(null as never);

      await expect(
        sellerProductService.getProductDetail(SELLER_ID, 'prod-x'),
      ).rejects.toMatchObject({ status: 404 });
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
