import type { JSendResponse } from '@/lib/jsend';
import type { AdminDashboardData } from '@/services/adminDashboard.service';
import { useQuery } from '@tanstack/react-query';

export type { AdminDashboardData } from '@/services/adminDashboard.service';

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  overview: () => [...adminDashboardKeys.all, 'overview'] as const,
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

export function fetchAdminDashboard() {
  return fetchApi<AdminDashboardData>('/api/admin/dashboard');
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKeys.overview(),
    queryFn: () => fetchAdminDashboard(),
  });
}
