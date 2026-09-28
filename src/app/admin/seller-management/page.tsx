import { AdminSellerManagementContent } from '@/components/admin/seller-management/admin-seller-management-content';
import { requireAdmin } from '@/lib/auth/auth-page-helper';

export default async function AdminSellerManagementPage() {
  await requireAdmin();
  return <AdminSellerManagementContent />;
}
