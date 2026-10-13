import { SellerShopProfileContent } from '@/components/seller/shop-profile/seller-shop-profile-content';
import { requireSeller } from '@/lib/auth/auth-page-helper';

export default async function SellerShopProfilePage() {
  await requireSeller();
  return <SellerShopProfileContent />;
}
