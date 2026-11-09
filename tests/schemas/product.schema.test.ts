import { createProductSchema } from '@/schemas/product.schema';
import { describe, expect, it } from 'vitest';

const base = {
  articleId: 'article-1',
  name: 'Songket',
  slug: 'songket',
  price: 250000,
  sku: 'AUTO',
  weight: 400,
  clothingType: 'Kain Songket',
  variants: [
    {
      name: 'Merah',
      type: 'size' as const,
      price: 250000,
      stock: 5,
      sku: 'AUTO',
      imageURL: '',
    },
  ],
};

describe('createProductSchema imageURL', { tags: ['backend'] }, () => {
  it('treats an empty optional image URL as no image', () => {
    const parsed = createProductSchema.parse({ ...base, imageURL: '' });
    expect(parsed.imageURL).toBeNull();
    expect(parsed.variants[0].imageURL).toBeNull();
  });

  it('still rejects a malformed URL', () => {
    expect(
      createProductSchema.safeParse({ ...base, imageURL: 'bukan-url' }).success,
    ).toBe(false);
  });
});
