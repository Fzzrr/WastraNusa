import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import { articleService } from '@/services/article.service';
import { productService } from '@/services/product.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/article.service');
vi.unmock('@/services/product.service');

vi.mock('@/repositories/article.repository', () => ({
  articleRepository: { getFieldOptions: vi.fn() },
}));
vi.mock('@/repositories/product.repository', () => ({
  productRepository: { getDistinctClothingTypes: vi.fn() },
}));

const articleRepo = vi.mocked(articleRepository);
const productRepo = vi.mocked(productRepository);

beforeEach(() => {
  vi.clearAllMocks();
  articleRepo.getFieldOptions.mockResolvedValue({
    motifLabels: ['Parang'],
    topics: ['Tekstil'],
    ethnicGroups: ['Jawa'],
    clothingTypes: ['Kebaya', 'Ulos'],
  });
  // Another seller's entries, one duplicated with different spacing.
  productRepo.getDistinctClothingTypes.mockResolvedValue([' Kebaya', 'Batik']);
});

describe('shared saved-entry options', { tags: ['backend'] }, () => {
  it('article form sees clothing types from every seller product', async () => {
    const options = await articleService.getFieldOptions();

    expect(options.clothingTypes).toEqual(['Batik', 'Kebaya', 'Ulos']);
    expect(options.motifLabels).toEqual(['Parang']);
  });

  it('product form sees clothing types from articles too', async () => {
    expect(await productService.getClothingTypes()).toEqual([
      'Batik',
      'Kebaya',
      'Ulos',
    ]);
  });
});
