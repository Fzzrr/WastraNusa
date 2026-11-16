import {
  type Cart,
  cartKeys,
  useAddToCart,
  useCart,
  useRemoveMultipleFromCart,
  useUpdateCartItem,
} from '@/hooks/use-cart';
import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createWrapper(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    ...config,
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

describe('use-cart hooks', { tags: ['frontend'] }, () => {
  const MOCK_CART: Cart = {
    id: 'cart-1',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        variantId: null,
        quantity: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product: {
          id: 'prod-1',
          name: 'Product 1',
          price: 100,
          stock: 10,
          slug: 'prod-1',
          clothingType: 'T-Shirt',
          province: 'Jawa',
          variants: [{ stock: 10 }],
        },
      },
    ],
  };

  it('should fetch cart', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_CART) as never,
    );

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_CART);
    expect(global.fetch).toHaveBeenCalledWith('/api/cart', expect.any(Object));
  });

  it('should optimistically update on add to cart', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(cartKeys.list(), MOCK_CART);

    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        ...MOCK_CART,
        items: [
          ...MOCK_CART.items,
          { id: 'item-2', productId: 'prod-2', quantity: 1 },
        ],
      }) as never,
    );

    const { result } = renderHook(() => useAddToCart(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({ productId: 'prod-2', quantity: 1 });
    });

    // Should immediately add a temp item to cache
    await waitFor(() => {
      const cached = queryClient.getQueryData<Cart>(cartKeys.list());
      expect(cached?.items.length).toBe(2);
      expect(cached?.items.find((i) => i.productId === 'prod-2')).toBeDefined();
    });
  });

  it('should optimistically update on update quantity', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(cartKeys.list(), MOCK_CART);

    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        ...MOCK_CART,
        items: [{ ...MOCK_CART.items[0], quantity: 5 }],
      }) as never,
    );

    const { result } = renderHook(() => useUpdateCartItem(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({ id: 'item-1', data: { quantity: 5 } });
    });

    // Should immediately update quantity in cache
    await waitFor(() => {
      const cached = queryClient.getQueryData<Cart>(cartKeys.list());
      expect(cached?.items[0].quantity).toBe(5);
    });
  });

  it('should optimistically update on remove from cart', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(cartKeys.list(), MOCK_CART);

    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        ...MOCK_CART,
        items: [],
      }) as never,
    );

    const { result } = renderHook(() => useRemoveMultipleFromCart(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({ cartItemIds: ['item-1'] });
    });

    // Should immediately remove item from cache
    await waitFor(() => {
      const cached = queryClient.getQueryData<Cart>(cartKeys.list());
      expect(cached?.items.length).toBe(0);
    });
  });
});
