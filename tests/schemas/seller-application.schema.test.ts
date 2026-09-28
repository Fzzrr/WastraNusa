import {
  createSellerApplicationSchema,
  reviewSellerApplicationSchema,
} from '@/schemas/seller-application.schema';
import { describe, expect, it } from 'vitest';

describe('seller-application schemas', { tags: ['backend'] }, () => {
  describe('createSellerApplicationSchema', () => {
    it('accepts a minimal payload with only shopName', () => {
      const result = createSellerApplicationSchema.safeParse({
        shopName: 'Batik Sari Nusantara',
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional description and phoneNumber', () => {
      const result = createSellerApplicationSchema.safeParse({
        shopName: 'Batik Sari Nusantara',
        description: 'Toko batik tulis khas Pekalongan',
        phoneNumber: '081234567890',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty shopName', () => {
      const result = createSellerApplicationSchema.safeParse({ shopName: '' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing shopName', () => {
      const result = createSellerApplicationSchema.safeParse({
        description: 'no name',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reviewSellerApplicationSchema', () => {
    it('accepts an approval without a rejection reason', () => {
      const result = reviewSellerApplicationSchema.safeParse({
        status: 'approved',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a rejection that carries a reason', () => {
      const result = reviewSellerApplicationSchema.safeParse({
        status: 'rejected',
        rejectionReason: 'Dokumen tidak lengkap',
      });
      expect(result.success).toBe(true);
    });

    it('rejects a rejection with no reason', () => {
      const result = reviewSellerApplicationSchema.safeParse({
        status: 'rejected',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['rejectionReason']);
      }
    });

    it('rejects a rejection with a blank/whitespace reason', () => {
      const result = reviewSellerApplicationSchema.safeParse({
        status: 'rejected',
        rejectionReason: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an unknown status value', () => {
      const result = reviewSellerApplicationSchema.safeParse({
        status: 'pending',
      });
      expect(result.success).toBe(false);
    });
  });
});
