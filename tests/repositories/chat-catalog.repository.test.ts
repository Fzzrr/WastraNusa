import prisma from '@/lib/prisma';
import { productRepository } from '@/repositories/product.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/repositories/product.repository');
vi.mock('@/lib/prisma', () => ({
  default: { product: { findMany: vi.fn() } },
}));

const article = {
  id: 'opened',
  topic: 'Batik',
  motifLabel: 'Kawung',
  province: 'Yogyakarta',
  clothingType: 'Kemeja',
};

describe('chat catalog queries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches exact products separately from close matches and excludes unavailable/private rows', async () => {
    const query = vi.mocked(prisma.product.findMany);
    query
      .mockResolvedValueOnce([{ id: 'exact' }] as never)
      .mockResolvedValueOnce([{ id: 'related' }] as never);
    const result = await productRepository.findChatProducts(article);
    expect(result.map((product) => product.id)).toEqual(['exact', 'related']);
    const [exactCall, relatedCall] = query.mock.calls.map(([args]) => args);
    expect(exactCall?.where).toEqual({
      AND: [
        {
          status: 'active',
          variants: { some: { stock: { gt: 0 } } },
          article: { status: 'published' },
        },
        { articleId: 'opened' },
      ],
    });
    expect(relatedCall?.where).toEqual({
      AND: [
        {
          status: 'active',
          variants: { some: { stock: { gt: 0 } } },
          article: { status: 'published' },
        },
        { articleId: { not: 'opened' } },
        {
          article: {
            topic: 'Batik',
            OR: [
              { motifLabel: { equals: 'Kawung', mode: 'insensitive' } },
              { province: 'Yogyakarta', clothingType: 'Kemeja' },
            ],
          },
        },
      ],
    });
  });

  it('does not expand to arbitrary products when the article lacks close-match metadata', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    await productRepository.findChatProducts({
      ...article,
      motifLabel: '',
      province: null,
    });
    expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
  });
});
