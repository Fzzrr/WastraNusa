import { parseJSend } from '@/lib/api-client';
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from '@/schemas/address.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --------------- Types ---------------

export interface CustomerAddress {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string | null;
  postalCode: string;
  fullAddress: string;
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// --------------- Query Key Factory ---------------

export const addressKeys = {
  all: ['addresses'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
  list: () => [...addressKeys.lists()] as const,
  detail: (id: string) => [...addressKeys.all, 'detail', id] as const,
};

async function fetchAddressesApi(): Promise<CustomerAddress[]> {
  const response = await fetch('/api/addresses', {
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSend<CustomerAddress[]>(response);
}

async function createAddressApi(
  data: CreateAddressInput,
): Promise<CustomerAddress> {
  const response = await fetch('/api/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSend<CustomerAddress>(response);
}

async function updateAddressApi(
  id: string,
  data: UpdateAddressInput,
): Promise<CustomerAddress> {
  const response = await fetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSend<CustomerAddress>(response);
}

async function deleteAddressApi(id: string): Promise<void> {
  const response = await fetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  await parseJSend<null>(response);
}

async function setDefaultAddressApi(id: string): Promise<CustomerAddress> {
  const response = await fetch(
    `/api/addresses/${encodeURIComponent(id)}/default`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return parseJSend<CustomerAddress>(response);
}

// --------------- Hooks ---------------

/**
 * Fetch all saved addresses for the authenticated user.
 */
export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: fetchAddressesApi,
    staleTime: 1000 * 60 * 5, // 5 minutes — addresses change infrequently
  });
}

/**
 * Create a new address. Invalidates the address list on success.
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressInput) => createAddressApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/**
 * Update an existing address. Invalidates the address list on success.
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressInput }) =>
      updateAddressApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/**
 * Delete an address. Optimistically removes it from the cache, then
 * reconciles with the server response.
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAddressApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      const previous = queryClient.getQueryData<CustomerAddress[]>(
        addressKeys.list(),
      );

      queryClient.setQueryData<CustomerAddress[]>(addressKeys.list(), (old) =>
        old ? old.filter((a) => a.id !== id) : old,
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(addressKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/**
 * Set an address as the default. Optimistically updates isDefault flags
 * across all cached addresses.
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultAddressApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      const previous = queryClient.getQueryData<CustomerAddress[]>(
        addressKeys.list(),
      );

      queryClient.setQueryData<CustomerAddress[]>(addressKeys.list(), (old) =>
        old ? old.map((a) => ({ ...a, isDefault: a.id === id })) : old,
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(addressKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}
