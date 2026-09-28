import {
  type OrderDetail,
  type PaginatedOrders,
  useCancelOrder,
  useOrderDetail,
  useOrders,
} from '@/hooks/use-order';
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

describe('useOrders hook', { tags: ['frontend'] }, () => {
  const MOCK_ORDERS: PaginatedOrders = {
    data: [
      {
        orderId: 'order-id-1',
        id: 'order-1',
        date: '2026-01-01',
        totalPrice: '150000',
        status: 'Dikonfirmasi',
        paymentStatus: 'paid',
        paymentStatusLabel: 'Lunas',
        paymentDeadlineAt: null,
        canCancel: false,
        products: [
          {
            category: 'Batik',
            name: 'Kemeja Batik',
            location: 'Solo',
            quantity: 1,
            imageURL: null,
            unitPrice: '150000',
          },
        ],
        actions: ['Detail'],
      },
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 5,
      totalPages: 1,
    },
  };

  const MOCK_ORDER_DETAIL: OrderDetail = {
    orderId: 'order-id-1',
    orderNumber: 'ORD-1',
    orderDate: '1 Jan 2026',
    orderStatus: 'Dikonfirmasi',
    paymentStatus: 'paid',
    paymentStatusLabel: 'Lunas',
    paymentMethod: 'bank_transfer',
    paymentDeadlineAt: null,
    canCancel: false,
    totals: {
      subtotal: 'Rp 120.000',
      shippingCost: 'Rp 30.000',
      totalAmount: 'Rp 150.000',
    },
    products: [
      {
        id: 'prod-1',
        name: 'Kemeja Batik',
        category: 'Batik',
        location: 'Solo',
        quantity: 1,
        unitPrice: 'Rp 120.000',
        imageURL: null,
      },
    ],
    shipping: {
      courier: 'JNE',
      courierService: 'REG',
      trackingNumber: 'RESI-1',
      estimatedDelivery: null,
      recipientName: 'User',
      recipientPhone: '0812',
      fullAddress: 'Jl. Mawar No. 1',
      city: 'Solo',
      province: 'Jawa Tengah',
      district: 'Laweyan',
      subdistrict: null,
      postalCode: '57147',
    },
    paymentTransaction: {
      id: 'trx-1',
      status: 'success',
      paymentUrl: null,
      vaNumber: '123456789',
      paidAt: null,
      expiredAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    customerNotes: null,
  };

  it('should fetch orders with default params', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_ORDERS) as never,
    );

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_ORDERS);
    expect(global.fetch).toHaveBeenCalledWith('/api/orders?page=1&limit=5');
  });

  it('should fetch orders with custom status and pagination', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_ORDERS) as never,
    );

    const { result } = renderHook(() => useOrders('Dikirim', 2, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/orders?status=Dikirim&page=2&limit=10',
    );
  });

  it('should handle error response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 500 }) as never,
    );

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Gagal mengambil data pesanan');
  });

  it('should fetch order detail by identifier', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_ORDER_DETAIL) as never,
    );

    const { result } = renderHook(() => useOrderDetail('ORD-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_ORDER_DETAIL);
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/ORD-1');
  });

  it('should cancel an order and invalidate order queries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_ORDER_DETAIL) as never,
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('ORD-1');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/orders/ORD-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'cancel' }),
    });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['orders'] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['orders', 'detail', 'ORD-1'] }),
    );
  });
});
