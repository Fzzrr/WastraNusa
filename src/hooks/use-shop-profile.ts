import { fetchApi, mutateApi } from '@/lib/api-client';
import type { UpdateShopProfileInput } from '@/schemas/shop-profile.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --------------- Types ---------------

export interface ShopProfile {
  id: string;
  userId: string;
  shopName: string;
  description: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  logoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

// --------------- Query Key Factory ---------------

export const shopProfileKeys = {
  all: ['shop-profile'] as const,
  mine: () => [...shopProfileKeys.all, 'mine'] as const,
};

// --------------- Seller Hooks ---------------

/**
 * The authenticated seller's own shop profile (null if none exists yet).
 */
export function useMyShopProfile() {
  return useQuery({
    queryKey: shopProfileKeys.mine(),
    queryFn: () => fetchApi<ShopProfile | null>('/api/seller/shop-profile'),
    staleTime: 1000 * 60,
  });
}

/**
 * Update the authenticated seller's shop profile.
 */
export function useUpdateShopProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShopProfileInput) =>
      mutateApi<ShopProfile>('/api/seller/shop-profile', 'PATCH', data),
    onSuccess: (profile) => {
      queryClient.setQueryData(shopProfileKeys.mine(), profile);
      queryClient.invalidateQueries({ queryKey: shopProfileKeys.mine() });
    },
  });
}
