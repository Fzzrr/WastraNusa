'use client';

import { parseJSend } from '@/lib/api-client';
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
  count: () => [...cartKeys.all, 'count'] as const,
};

async function fetchCartApi(): Promise<Cart> {
  const response = await fetch('/api/cart', {
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSend<Cart>(response);
}

async function addToCartApi(data: AddToCartInput): Promise<Cart> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSend<Cart>(response);
}

async function updateCartItemApi(
  id: string,
  data: UpdateCartItemInput,
): Promise<Cart> {
  const response = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSend<Cart>(response);
}

async function removeFromCartApi(id: string): Promise<Cart> {
  const response = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSend<Cart>(response);
}

async function removeMultipleFromCartApi(
  data: RemoveFromCartInput,
): Promise<Cart> {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSend<Cart>(response);
}

async function clearCartApi(): Promise<Cart> {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItemIds: [] }),
  });
  return parseJSend<Cart>(response);
}

// --------------- Hooks ---------------

/**
 * Fetch user's cart with all items.
 * Implements caching with 3-minute stale time for cart data.
 */
export function useCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cartKeys.list(),
    queryFn: fetchCartApi,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 3, // 3 minutes — cart data changes less frequently
  });
}

/**
 * Add item to cart with optimistic updates.
 * Frontend adds item to cache immediately, backend call is async.
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartInput) => addToCartApi(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.list() });

      const previousCart = queryClient.getQueryData<Cart>(cartKeys.list());

      if (previousCart) {
        // Check if item already exists
        const existingItemIndex = previousCart.items.findIndex(
          (item) =>
            item.productId === data.productId &&
            item.variantId === (data.variantId || null),
        );

        let updatedCart: Cart;

        if (existingItemIndex >= 0) {
          // Update quantity if exists
          updatedCart = {
            ...previousCart,
            items: previousCart.items.map((item, idx) =>
              idx === existingItemIndex
                ? {
                    ...item,
                    quantity: item.quantity + data.quantity,
                  }
                : item,
            ),
          };
        } else {
          // Add new item with temporary ID
          const newItem: CartItemWithRelations = {
            id: `temp-${Date.now()}`,
            cartId: previousCart.id,
            productId: data.productId,
            variantId: data.variantId || null,
            quantity: data.quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
          updatedCart = {
            ...previousCart,
            items: [...previousCart.items, newItem],
          };
        }

        queryClient.setQueryData(cartKeys.list(), updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.list(), newCart);
    },
    retry: 1,
  });
}

/**
 * Update cart item quantity with optimistic updates.
 * Frontend updates cache immediately, backend call is async.
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCartItemInput }) =>
      updateCartItemApi(id, data),
    onMutate: async ({ id, data }) => {
      // Update cache immediately
      await queryClient.cancelQueries({ queryKey: cartKeys.list() });
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.list());

      if (previousCart) {
        const updatedCart = {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === id ? { ...item, quantity: data.quantity } : item,
          ),
        };
        queryClient.setQueryData(cartKeys.list(), updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.list(), newCart);
    },
    retry: 1,
  });
}

/**
 * Remove single item from cart with optimistic updates.
 * Frontend removes item immediately, backend call is async.
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeFromCartApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.list() });

      const previousCart = queryClient.getQueryData<Cart>(cartKeys.list());

      if (previousCart) {
        const updatedCart = {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== id),
        };
        queryClient.setQueryData(cartKeys.list(), updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.list(), newCart);
    },
    retry: 1,
  });
}

/**
 * Remove multiple items from cart with optimistic updates.
 * Frontend removes items immediately, backend call is async.
 */
export function useRemoveMultipleFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveFromCartInput) => removeMultipleFromCartApi(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.list() });
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.list());

      if (previousCart) {
        const idsToRemove = new Set(data.cartItemIds);
        const updatedCart = {
          ...previousCart,
          items: previousCart.items.filter((item) => !idsToRemove.has(item.id)),
        };
        queryClient.setQueryData(cartKeys.list(), updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.list(), newCart);
    },
    retry: 1,
  });
}

/**
 * Clear entire cart with optimistic updates.
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCartApi(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKeys.list() });

      const previousCart = queryClient.getQueryData<Cart>(cartKeys.list());

      if (previousCart) {
        const updatedCart = {
          ...previousCart,
          items: [],
        };
        queryClient.setQueryData(cartKeys.list(), updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.list(), newCart);
    },
    retry: 1,
  });
}
