import { SellerDashboardContent } from '@/components/seller/dashboard/seller-dashboard-content';
import { requireSeller } from '@/lib/auth/auth-page-helper';

export default async function SellerDashboardPage() {
  await requireSeller();
  return <SellerDashboardContent />;
}
