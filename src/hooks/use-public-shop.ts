import { fetchApi } from '@/lib/api-client';
import type { PublicShopResponse } from '@/types/shop';
import { useQuery } from '@tanstack/react-query';

// --------------- Query Key Factory ---------------

export const publicShopKeys = {
  all: ['public-shop'] as const,
  detail: (sellerId: string) => [...publicShopKeys.all, sellerId] as const,
};

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
