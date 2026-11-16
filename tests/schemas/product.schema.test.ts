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

describe('createProductSchema price', { tags: ['backend'] }, () => {
  const withPrice = (price: number, variantPrice = price) => ({
    ...base,
    price,
    variants: [{ ...base.variants[0], price: variantPrice }],
  });

  it.each([15000.5, 0, 2_000_000_000])(
    'rejects %s as a product or variant price',
    (price) => {
      expect(createProductSchema.safeParse(withPrice(price)).success).toBe(
        false,
      );
      expect(
        createProductSchema.safeParse(withPrice(250000, price)).success,
      ).toBe(false);
    },
  );
});

describe('image URLs', { tags: ['backend'] }, () => {
  it.each(['javascript:alert(1)', 'data:image/png;base64,AA'])(
    'rejects %s',
    (imageURL) => {
      expect(createProductSchema.safeParse({ ...base, imageURL }).success).toBe(
        false,
      );
    },
  );
});
