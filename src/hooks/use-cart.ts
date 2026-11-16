'use client';

import { fetchApi, mutateApi } from '@/lib/api-client';
import type {
  AddToCartInput,
  RemoveFromCartInput,
  UpdateCartItemInput,
} from '@/schemas/cart.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --------------- Types ---------------

export interface CartItemWithRelations {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
    clothingType: string;
    province: string;
    imageURL?: string | null;
    variants?: Array<{
      stock: number;
    }>;
  };
  variant?: {
    id: string;
    name: string;
    type: string;
    price: number | null;
    stock: number;
    imageURL?: string | null;
  } | null;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItemWithRelations[];
}

// --------------- Query Key Factory ---------------

export const cartKeys = {
  all: ['cart'] as const,
  lists: () => [...cartKeys.all, 'list'] as const,
  list: () => [...cartKeys.lists()] as const,
};

const cartItemPath = (id: string) => `/api/cart/${encodeURIComponent(id)}`;

// --------------- Hooks ---------------

/**
 * Fetch user's cart with all items.
 * Implements caching with 3-minute stale time for cart data.
 */
export function useCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cartKeys.list(),
    queryFn: () => fetchApi<Cart>('/api/cart'),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 3, // 3 minutes — cart data changes less frequently
  });
}

/**
 * Shared optimistic cart mutation: `applyOptimistic` patches the cached cart
 * right away, a failure rolls it back, and the server's cart replaces it on
 * success.
 */
function useCartMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Cart>,
  applyOptimistic: (cart: Cart, input: TInput) => Cart,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.list() });
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.list());
      if (previousCart) {
        queryClient.setQueryData(
          cartKeys.list(),
          applyOptimistic(previousCart, input),
        );
      }
      return { previousCart };
    },
    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.list(), newCart);
    },
    // No retry: re-sending a POST whose response was lost adds the item twice.
  });
}

/** Add an item: bumps the quantity if it is already in the cart. */
export function useAddToCart() {
  return useCartMutation(
    (data: AddToCartInput) => mutateApi<Cart>('/api/cart', 'POST', data),
    (cart, data) => {
      const variantId = data.variantId || null;
      const exists = cart.items.some(
        (item) =>
          item.productId === data.productId && item.variantId === variantId,
      );
      if (exists) {
        return {
          ...cart,
          items: cart.items.map((item) =>
            item.productId === data.productId && item.variantId === variantId
              ? { ...item, quantity: item.quantity + data.quantity }
              : item,
          ),
        };
      }

      // Placeholder until the server responds with the real item.
      const now = new Date().toISOString();
      const newItem: CartItemWithRelations = {
        id: `temp-${Date.now()}`,
        cartId: cart.id,
        productId: data.productId,
        variantId,
        quantity: data.quantity,
        createdAt: now,
        updatedAt: now,
        product: {
          id: data.productId,
          name: 'Loading...',
          price: 0,
          stock: 0,
          slug: '',
          clothingType: '',
          province: '',
          variants: [],
        },
      };
      return { ...cart, items: [...cart.items, newItem] };
    },
  );
}

/** Update one item's quantity. */
export function useUpdateCartItem() {
  return useCartMutation(
    ({ id, data }: { id: string; data: UpdateCartItemInput }) =>
      mutateApi<Cart>(cartItemPath(id), 'PUT', data),
    (cart, { id, data }) => ({
      ...cart,
      items: cart.items.map((item) =>
        item.id === id ? { ...item, quantity: data.quantity } : item,
      ),
    }),
  );
}

/** Remove several items at once. */
export function useRemoveMultipleFromCart() {
  return useCartMutation(
    (data: RemoveFromCartInput) => mutateApi<Cart>('/api/cart', 'DELETE', data),
    (cart, data) => {
      const idsToRemove = new Set(data.cartItemIds);
      return {
        ...cart,
        items: cart.items.filter((item) => !idsToRemove.has(item.id)),
      };
    },
  );
}
