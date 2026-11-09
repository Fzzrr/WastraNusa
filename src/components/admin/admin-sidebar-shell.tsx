'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useArticleDashboard } from '@/hooks/use-article';
import { useAdminSellerApplications } from '@/hooks/use-seller-application';

export function AdminSidebarShell() {
  const { data: articleDashboardData } = useArticleDashboard();
  const { data: pendingApplications } = useAdminSellerApplications('pending');

  const navCounts = {
    Artikel: articleDashboardData?.totalArticles,
    'Manajemen Penjual': pendingApplications?.length,
  };

  return <AdminSidebar navCounts={navCounts} />;
}
