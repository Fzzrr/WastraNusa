import { shopProfileRepository } from '@/repositories/shopProfile.repository';
import { shopProfileService } from '@/services/shopProfile.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/shopProfile.repository', () => ({
  shopProfileRepository: {
    findBySeller: vi.fn(),
    updateBySeller: vi.fn(),
    createFromApplication: vi.fn(),
    buildCreateFromApplicationArgs: vi.fn(),
  },
}));

const mockRepo = vi.mocked(shopProfileRepository);

const SELLER_ID = 'seller-1';

const baseProfile = {
  id: 'shop-1',
  userId: SELLER_ID,
  shopName: 'Toko Lama',
  description: null,
  phoneNumber: null,
  email: null,
  address: null,
  city: null,
  province: null,
  logoURL: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validInput = {
  shopName: 'Toko Baru',
  description: 'Deskripsi toko',
  phoneNumber: '081234567890',
  email: 'toko@contoh.com',
  address: 'Jl. Melati No. 1',
  city: 'Yogyakarta',
  province: 'DI Yogyakarta',
  logoURL: 'https://contoh.com/logo.png',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('shopProfileService', { tags: ['backend'] }, () => {
  describe('getMyShopProfile', () => {
    it('returns the seller-scoped profile from the repository', async () => {
      mockRepo.findBySeller.mockResolvedValue(baseProfile as never);

      const result = await shopProfileService.getMyShopProfile(SELLER_ID);

      expect(mockRepo.findBySeller).toHaveBeenCalledWith(SELLER_ID);
      expect(result).toBe(baseProfile);
    });
  });

  describe('updateMyShopProfile', () => {
    it('404s when the seller has no profile yet', async () => {
      mockRepo.findBySeller.mockResolvedValue(null as never);

      await expect(
        shopProfileService.updateMyShopProfile(SELLER_ID, validInput),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockRepo.updateBySeller).not.toHaveBeenCalled();
    });

    it('persists trimmed fields and collapses blanks to null', async () => {
      mockRepo.findBySeller.mockResolvedValue(baseProfile as never);
      mockRepo.updateBySeller.mockResolvedValue(baseProfile as never);

      await shopProfileService.updateMyShopProfile(SELLER_ID, {
        shopName: '  Toko Baru  ',
        description: '   ',
        phoneNumber: '081234567890',
        email: '',
        address: undefined,
        city: 'Bandung',
        province: '',
        logoURL: '',
      });

      expect(mockRepo.updateBySeller).toHaveBeenCalledWith(
        SELLER_ID,
        expect.objectContaining({
          shopName: 'Toko Baru',
          description: null,
          phoneNumber: '081234567890',
          email: null,
          address: null,
          city: 'Bandung',
          province: null,
          logoURL: null,
        }),
      );
    });

    it('404s when the role-gated update matches no rows', async () => {
      mockRepo.findBySeller.mockResolvedValue(baseProfile as never);
      mockRepo.updateBySeller.mockResolvedValue(null as never);

      await expect(
        shopProfileService.updateMyShopProfile(SELLER_ID, validInput),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
