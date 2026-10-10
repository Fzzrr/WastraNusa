import type { JSendResponse } from '@/lib/jsend';
import type { PublicShopResponse } from '@/types/shop';
import { useQuery } from '@tanstack/react-query';

// --------------- Query Key Factory ---------------

export const publicShopKeys = {
  all: ['public-shop'] as const,
  detail: (sellerId: string) => [...publicShopKeys.all, sellerId] as const,
};

// --------------- Fetch Helpers ---------------

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
        ? String((body.data as { message: unknown }).message)
        : 'Request failed';
    throw new Error(message);
  }

  throw new Error(body.message);
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSend<T>(response);
}

// --------------- Public Shop Hook ---------------

/**
 * Public shop profile + products for a given seller (no auth).
 * Errors with "Toko tidak ditemukan" when the seller/shop is not found.
 */
export function usePublicShop(sellerId: string) {
  return useQuery({
    queryKey: publicShopKeys.detail(sellerId),
    queryFn: () =>
      fetchApi<PublicShopResponse>(`/api/shop/${encodeURIComponent(sellerId)}`),
    enabled: Boolean(sellerId),
    staleTime: 1000 * 60,
  });
}
