'use client';

import type { JSendResponse } from '@/lib/jsend';
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

async function checkoutApi(data: CheckoutInput): Promise<CheckoutResponse> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSend<CheckoutResponse>(response);
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: checkoutKeys.checkout(),
    mutationFn: (data: CheckoutInput) => checkoutApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    // Not idempotent: a retry after a lost response would create a second
    // order and reserve stock twice.
    retry: false,
  });
}
