import type { JSendResponse } from '@/lib/jsend';
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

async function parseJSend<T>(response: Response): Promise<T> {
  const body = (await response.json()) as JSendResponse<T>;

  if (body.status === 'success') {
    return body.data as T;
  }

  if (body.status === 'fail') {
    const message =
      typeof body.data === 'object' &&
      body.data !== null &&
      'message' in body.data
        ? String(body.data.message)
        : 'Request failed';

    throw new Error(message);
  }

  throw new Error(body.message);
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseJSend<T>(response);
}

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
