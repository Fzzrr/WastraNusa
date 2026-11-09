import CatalogDetailPage from '@/app/(public-page)/catalog/[slug]/page';
import EncyclopediaDetailPage from '@/app/(public-page)/encyclopedia/[slug]/page';
import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import { notFound } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('@/lib/auth/auth', () => ({
  getSessionUser: vi.fn(async () => null),
}));
vi.mock('@/components/catalog/detail/catalog-detail-main', () => ({
  CatalogDetailMain: () => null,
}));
vi.mock('@/components/encyclopedia/encyclopedia-detail-main', () => ({
  EncyclopediaDetailMain: () => null,
}));

const params = Promise.resolve({ slug: 'does-not-exist' });

describe('slug detail pages', { tags: ['frontend'] }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides draft articles from guests', async () => {
    vi.mocked(articleRepository.findByIdOrSlug).mockResolvedValue({
      id: 'x',
      status: 'draft',
    } as never);

    await expect(EncyclopediaDetailPage({ params })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });

  it.each([
    ['catalog', CatalogDetailPage, productRepository],
    ['encyclopedia', EncyclopediaDetailPage, articleRepository],
  ] as const)(
    '%s calls notFound for an unknown slug',
    async (_, Page, repo) => {
      vi.mocked(repo.findByIdOrSlug).mockResolvedValue(null);

      await expect(Page({ params })).rejects.toThrow('NEXT_NOT_FOUND');
      expect(notFound).toHaveBeenCalled();
    },
  );

  it.each([
    ['catalog', CatalogDetailPage, productRepository],
    ['encyclopedia', EncyclopediaDetailPage, articleRepository],
  ] as const)('%s renders when the slug exists', async (_, Page, repo) => {
    vi.mocked(repo.findByIdOrSlug).mockResolvedValue({
      id: 'x',
      status: 'published',
      sellerId: 'seller-1',
    } as never);

    await expect(Page({ params })).resolves.toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
  });

  it('does not swallow repository errors', async () => {
    vi.mocked(productRepository.findByIdOrSlug).mockRejectedValue(
      new Error('db down'),
    );

    await expect(CatalogDetailPage({ params })).rejects.toThrow('db down');
    expect(notFound).not.toHaveBeenCalled();
  });
});
