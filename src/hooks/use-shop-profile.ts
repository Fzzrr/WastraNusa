import type { JSendResponse } from '@/lib/jsend';
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

async function mutateApi<T>(
  path: string,
  method: 'POST' | 'PATCH',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJSend<T>(response);
}

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
