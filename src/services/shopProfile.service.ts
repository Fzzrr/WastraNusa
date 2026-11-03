import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { shopProfileRepository } from '@/repositories/shopProfile.repository';
import { type UpdateShopProfileInput } from '@/schemas/shop-profile.schema';

/** Collapse an empty/whitespace-only optional value to `null` for storage. */
const toNullable = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Business logic for a seller managing their OWN shop profile. `userId` is the
 * authenticated seller's id (from `withApiSeller`). Both reads and writes go
 * through the role-gated repository, so the profile is only ever reachable
 * while the user actually holds the `seller` role.
 */
export const shopProfileService = {
  /**
   * The current seller's shop profile (or `null` if they have none yet / are
   * no longer a seller).
   */
  getMyShopProfile: async (userId: string) => {
    return shopProfileRepository.findBySeller(userId);
  },

  /**
   * Update the current seller's shop profile. Fails with 404 when no profile
   * exists for this seller (it is created on application approval).
   */
  updateMyShopProfile: async (userId: string, data: UpdateShopProfileInput) => {
    const existing = await shopProfileRepository.findBySeller(userId);
    if (!existing) {
      throw new ApiError('Profil toko tidak ditemukan', 404);
    }

    const updated = await shopProfileRepository.updateBySeller(userId, {
      shopName: data.shopName.trim(),
      description: toNullable(data.description),
      phoneNumber: toNullable(data.phoneNumber),
      email: toNullable(data.email),
      address: toNullable(data.address),
      city: toNullable(data.city),
      province: toNullable(data.province),
      logoURL: toNullable(data.logoURL),
    });

    if (!updated) {
      throw new ApiError('Profil toko tidak ditemukan', 404);
    }

    logger.info('Shop profile updated', { userId });
    return updated;
  },
};
