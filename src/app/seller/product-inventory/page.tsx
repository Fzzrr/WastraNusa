import { SellerProductInventoryContent } from '@/components/seller/product-inventory/seller-product-inventory-content';
import { requireSeller } from '@/lib/auth/auth-page-helper';

export default async function SellerProductInventoryPage() {
  await requireSeller();
  return <SellerProductInventoryContent />;
}
