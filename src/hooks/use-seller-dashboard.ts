import { fetchApi } from '@/lib/api-client';
import type {
  SellerDashboardData,
  SellerDashboardPeriod,
} from '@/services/sellerDashboard.service';
import { useQuery } from '@tanstack/react-query';

export type {
  SellerDashboardData,
  SellerDashboardPeriod,
} from '@/services/sellerDashboard.service';

export const sellerDashboardKeys = {
  all: ['seller-dashboard'] as const,
  overview: (period: SellerDashboardPeriod) =>
    [...sellerDashboardKeys.all, 'overview', period] as const,
};

export function fetchSellerDashboard(period: SellerDashboardPeriod) {
  return fetchApi<SellerDashboardData>(
    `/api/seller/dashboard?period=${period}`,
  );
}

export function useSellerDashboard(period: SellerDashboardPeriod) {
  return useQuery({
    queryKey: sellerDashboardKeys.overview(period),
    queryFn: () => fetchSellerDashboard(period),
    placeholderData: (previousData) => previousData,
  });
}
