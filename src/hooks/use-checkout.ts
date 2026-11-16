'use client';

import { mutateApi } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CheckoutItemInput {
  cartItemId?: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  frontendPrice?: number;
}

export interface CheckoutInput {
  items: CheckoutItemInput[];
  shippingAddressId?: string;
  shippingOptionId: string;
  customerNotes?: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  token: string;
  redirect_url: string;
}

export const checkoutKeys = {
  all: ['checkout'] as const,
  checkout: () => [...checkoutKeys.all, 'mutation'] as const,
};

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: checkoutKeys.checkout(),
    mutationFn: (data: CheckoutInput) =>
      mutateApi<CheckoutResponse>('/api/checkout', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    // Not idempotent: a retry after a lost response would create a second
    // order and reserve stock twice.
    retry: false,
  });
}
