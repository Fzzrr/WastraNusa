import type { ProductInventoryItem } from './product';

export interface PublicShopProfile {
  sellerId: string; // the seller's user id
  shopName: string;
  description: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  logoURL: string | null;
  sellerName: string; // user.name
  joinedAt: string; // shop profile createdAt, ISO string
}

export interface PublicShopResponse {
  shop: PublicShopProfile;
  products: ProductInventoryItem[];
  productCount: number;
}
