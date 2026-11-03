import prisma from '@/lib/prisma';
import { productVariantRepository } from '@/repositories/productVariant.repository';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { SEED_PRODUCT_1 } from '../../prisma/dev-seeds/product.seed';

vi.unmock('@/lib/prisma');
vi.unmock('@/repositories/productVariant.repository');

describe('productVariantRepository', { tags: ['db'] }, () => {
  let variantId: string;

  beforeAll(async () => {
    variantId = crypto.randomUUID();

    await prisma.productVariant.create({
      data: {
        id: variantId,
        productId: SEED_PRODUCT_1.id,
        name: `Test Variant ${variantId.slice(0, 8)}`,
        type: 'size',
        price: 100000,
        stock: 20,
        sku: `TEST-VAR-${variantId.slice(0, 8)}`,
      },
    });
  });

  afterAll(async () => {
    await prisma.productVariant
      .delete({ where: { id: variantId } })
      .catch(() => {
        // Ignore cleanup errors so test teardown stays resilient.
      });
  });

  describe('findVariantById', () => {
    it('should find variant by ID', async () => {
      const variant = await productVariantRepository.findVariantById(variantId);

      expect(variant).toBeDefined();
      expect(variant?.id).toBe(variantId);
      expect(variant?.name).toContain('Test Variant');
    });

    it('should return null for non-existent ID', async () => {
      const variant = await productVariantRepository.findVariantById(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(variant).toBeNull();
    });
  });

  describe('incrementVariantStock', () => {
    it('should increment variant stock', async () => {
      const before = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      await productVariantRepository.incrementVariantStock(variantId, 3);

      const after = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      expect(after!.stock).toBe(before!.stock + 3);

      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: before!.stock },
      });
    });
  });
});
