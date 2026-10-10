import { Prisma } from '@/generated/prisma/client';
import { ROLES } from '@/lib/auth/roles';
import prisma from '@/lib/prisma';

/** The shop fields copied from a seller application when it is approved. */
export type ShopProfileSeed = {
  shopName: string;
  description?: string | null;
  phoneNumber?: string | null;
};

/**
 * Seller-scoped access to the one-to-one shop profile. Every read and write is
 * gated on the owner currently holding the `seller` role, so a profile left
 * behind by a demoted user is never fetched or mutated until they are a seller
 * again.
 */
export const shopProfileRepository = {
  /**
   * The shop profile owned by `userId`, but only while that user is a seller.
   * Returns `null` for anyone whose role is not `seller` (defense in depth on
   * top of the `withApiSeller` / `requireSeller` guards).
   */
  findBySeller: async (userId: string) => {
    return prisma.shopProfile.findFirst({
      where: { userId, user: { role: ROLES.SELLER } },
    });
  },

  /**
   * Update the seller's own profile. The role filter means a non-seller write
   * resolves to zero rows and returns `null` instead of mutating anything.
   */
  updateBySeller: async (
    userId: string,
    data: Prisma.ShopProfileUncheckedUpdateManyInput,
  ) => {
    const result = await prisma.shopProfile.updateMany({
      where: { userId, user: { role: ROLES.SELLER } },
      data,
    });
    if (result.count === 0) return null;
    return prisma.shopProfile.findUnique({ where: { userId } });
  },

  /**
   * Prisma `upsert` args that copy an approved application into the shop
   * profile. On re-approval the `update` is intentionally empty so a seller's
   * previously edited profile is preserved rather than overwritten.
   */
  buildCreateFromApplicationArgs: (userId: string, shop: ShopProfileSeed) =>
    ({
      where: { userId },
      create: {
        id: crypto.randomUUID(),
        userId,
        shopName: shop.shopName,
        description: shop.description ?? null,
        phoneNumber: shop.phoneNumber ?? null,
      },
      update: {},
    }) satisfies Prisma.ShopProfileUpsertArgs,

  /** Standalone copy of an approved application into the shop profile. */
  createFromApplication: async (userId: string, shop: ShopProfileSeed) => {
    return prisma.shopProfile.upsert(
      shopProfileRepository.buildCreateFromApplicationArgs(userId, shop),
    );
  },
};
