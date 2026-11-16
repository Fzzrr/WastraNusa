import { ApiError } from '@/lib/error';
import { productRepository } from '@/repositories/product.repository';
import { shopProfileRepository } from '@/repositories/shopProfile.repository';
import { mapProduct } from '@/services/product.service';
import { type PublicShopResponse } from '@/types/shop';

export const publicShopService = {
  /**
   * The public shop-profile view for a seller: the profile fields plus the
   * seller's catalog-visible products. 404s once the owner is no longer a
   * seller (see `findPublicByUserId`).
   */
  getPublicShop: async (sellerId: string): Promise<PublicShopResponse> => {
    const profile = await shopProfileRepository.findPublicByUserId(sellerId);
    if (!profile) {
      throw new ApiError('Toko tidak ditemukan', 404);
    }

    const products = await productRepository.findActiveBySeller(sellerId);
    const mappedProducts = products.map(mapProduct);

    return {
      shop: {
        sellerId: profile.userId,
        shopName: profile.shopName,
        description: profile.description,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        province: profile.province,
        logoURL: profile.logoURL,
        sellerName: profile.user.name,
        joinedAt: profile.createdAt.toISOString(),
      },
      products: mappedProducts,
      productCount: mappedProducts.length,
    };
  },
};
