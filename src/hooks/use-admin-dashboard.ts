import { fetchApi } from '@/lib/api-client';
import type { AdminDashboardData } from '@/services/adminDashboard.service';
import { useQuery } from '@tanstack/react-query';

export type { AdminDashboardData } from '@/services/adminDashboard.service';

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  overview: () => [...adminDashboardKeys.all, 'overview'] as const,
};

export function fetchAdminDashboard() {
  return fetchApi<AdminDashboardData>('/api/admin/dashboard');
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKeys.overview(),
    queryFn: () => fetchAdminDashboard(),
  });
}
