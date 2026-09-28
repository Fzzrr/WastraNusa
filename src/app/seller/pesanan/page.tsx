import { SellerOrderContent } from '@/components/seller/pesanan/seller-order-content';
import { requireSeller } from '@/lib/auth/auth-page-helper';

export default async function SellerOrderPage() {
  await requireSeller();
  return <SellerOrderContent />;
}
