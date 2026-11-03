import { updateShopProfileSchema } from '@/schemas/shop-profile.schema';
import { describe, expect, it } from 'vitest';

describe('shop-profile schemas', { tags: ['backend'] }, () => {
  describe('updateShopProfileSchema', () => {
    it('accepts a minimal payload with only shopName', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Batik Sari Nusantara',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a full valid payload', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Batik Sari Nusantara',
        description: 'Toko batik tulis khas Pekalongan',
        phoneNumber: '081234567890',
        email: 'toko@contoh.com',
        address: 'Jl. Melati No. 1',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        logoURL: 'https://contoh.com/logo.png',
      });
      expect(result.success).toBe(true);
    });

    it('allows optional fields to be blank', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Toko Saya',
        phoneNumber: '',
        email: '',
        logoURL: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects a shopName shorter than 3 characters', () => {
      const result = updateShopProfileSchema.safeParse({ shopName: 'ab' });
      expect(result.success).toBe(false);
    });

    it('rejects a shopName longer than 60 characters', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'a'.repeat(61),
      });
      expect(result.success).toBe(false);
    });

    it('rejects an invalid phone number', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Toko Saya',
        phoneNumber: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an invalid email', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Toko Saya',
        email: 'bukan-email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a non-http logo URL', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Toko Saya',
        logoURL: 'ftp://contoh.com/logo.png',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a description longer than 500 characters', () => {
      const result = updateShopProfileSchema.safeParse({
        shopName: 'Toko Saya',
        description: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
