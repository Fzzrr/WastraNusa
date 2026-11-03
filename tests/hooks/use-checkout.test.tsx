import {
  type CheckoutInput,
  type CheckoutResponse,
  useCheckout,
} from '@/hooks/use-checkout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function createSuccessResponse<T>(data: T, status = 200) {
  return new Response(
    JSON.stringify({
      status: 'success',
      data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCheckout hook', { tags: ['frontend'] }, () => {
  const MOCK_CHECKOUT_RESPONSE: CheckoutResponse = {
    orderId: 'order-123',
    orderNumber: 'ORD-2026-001',
    token: 'snap-token-123',
    redirect_url: 'https://checkout.midtrans.com/snap-token-123',
  };

  const MOCK_CHECKOUT_INPUT: CheckoutInput = {
    items: [{ productId: 'prod-1', quantity: 1 }],
    shippingAddressId: 'addr-1',
    shippingOptionId: 'jne-reg',
  };

  it('should successfully execute checkout mutation', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_CHECKOUT_RESPONSE) as never,
    );

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(MOCK_CHECKOUT_INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_CHECKOUT_RESPONSE);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(MOCK_CHECKOUT_INPUT),
      }),
    );
  });

  it('should handle checkout failure', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            status: 'fail',
            data: { message: 'Insufficient stock' },
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ) as never,
    );

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(MOCK_CHECKOUT_INPUT);
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 2000,
    });
    expect(result.current.error?.message).toBe('Insufficient stock');
  });
});
