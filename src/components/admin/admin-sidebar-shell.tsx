'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { mergeArticleDashboardData } from '@/components/admin/dashboard/dashboard-data';
import { useArticleDashboard } from '@/hooks/use-article';
import { useProductDashboard } from '@/hooks/use-product-inventory';
import { useAdminSellerApplications } from '@/hooks/use-seller-application';
import { useMemo } from 'react';

export function AdminSidebarShell() {
  const { data: articleDashboardData } = useArticleDashboard();
  const { data: productDashboardData } = useProductDashboard();
  const { data: pendingApplications } = useAdminSellerApplications('pending');

  const sidebarData = useMemo(
    () => mergeArticleDashboardData(articleDashboardData, productDashboardData),
    [articleDashboardData, productDashboardData],
  );

  const navCounts = {
    Artikel: articleDashboardData?.totalArticles,
    'Seller Management': pendingApplications?.length,
  };

  return <AdminSidebar data={sidebarData} navCounts={navCounts} />;
}
