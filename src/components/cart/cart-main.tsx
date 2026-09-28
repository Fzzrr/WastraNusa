'use client';

import { CheckoutHeader } from '@/components/checkout/checkout-stepper';
import {
  ProfileEmptyState,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import {
  useCart,
  useRemoveMultipleFromCart,
  useUpdateCartItem,
} from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { ShoppingBag, ShoppingCart, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CartProduct } from './cart-list';
import { CartList } from './cart-list';
import { CartSummary } from './cart-summary';

export function CartMain() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const pendingQuantityUpdatesRef = useRef<Map<string, number>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch cart data using TanStack Query
  const { data: cart, isLoading, error } = useCart();
  const { mutate: updateQuantity } = useUpdateCartItem();
  const { mutate: removeMultiple } = useRemoveMultipleFromCart();

  const flushPendingQuantityUpdates = useCallback(
    (options?: { keepalive?: boolean }) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const updates = Array.from(pendingQuantityUpdatesRef.current.entries());
      if (updates.length === 0) return;

      pendingQuantityUpdatesRef.current.clear();

      setLocalQuantities((prev) => {
        const next = { ...prev };
        updates.forEach(([id]) => {
          delete next[id];
        });
        return next;
      });

      if (options?.keepalive) {
        updates.forEach(([id, quantity]) => {
          void fetch(`/api/cart/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
            keepalive: true,
          });
        });
        return;
      }

      updates.forEach(([id, quantity]) => {
        updateQuantity({ id, data: { quantity } });
      });
    },
    [updateQuantity],
  );

  const scheduleDebouncedQuantityUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushPendingQuantityUpdates();
    }, 5000);
  }, [flushPendingQuantityUpdates]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingQuantityUpdates({ keepalive: true });
    };

    const handlePageHide = () => {
      flushPendingQuantityUpdates({ keepalive: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingQuantityUpdates({ keepalive: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      flushPendingQuantityUpdates();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushPendingQuantityUpdates]);

  // Transform cart items to CartProduct interface
  const items: CartProduct[] = useMemo(() => {
    if (!cart || !cart.items) return [];

    return cart.items.map((cartItem) => {
      const availableStock =
        cartItem.variant?.stock ??
        cartItem.product.variants?.reduce(
          (total, variant) => total + variant.stock,
          0,
        ) ??
        0;

      return {
        id: cartItem.id,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        name: cartItem.product.name,
        price: Number(cartItem.product.price),
        size: cartItem.variant?.name || 'Default',
        stock: availableStock,
        quantity: localQuantities[cartItem.id] ?? cartItem.quantity,
        clothingType: cartItem.product.clothingType,
        province: cartItem.product.province,
        imageURL:
          cartItem.variant?.imageURL ?? cartItem.product.imageURL ?? null,
      };
    });
  }, [cart, localQuantities]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const baseQuantity =
      localQuantities[id] ?? cart?.items.find((i) => i.id === id)?.quantity;
    if (baseQuantity == null) return;

    const stockLimit =
      items.find((item) => item.id === id)?.stock ?? Number.MAX_SAFE_INTEGER;
    if (stockLimit <= 0) return;
    const newQty = Math.min(stockLimit, Math.max(1, baseQuantity + delta));

    setLocalQuantities((prev) => ({
      ...prev,
      [id]: newQty,
    }));
    pendingQuantityUpdatesRef.current.set(id, newQty);
    scheduleDebouncedQuantityUpdate();
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    removeMultiple({ cartItemIds: selectedIds });
    setSelectedIds([]);
  };

  // Calculate totals based on selected items
  const { totals, selectedItemsForSummary } = useMemo(() => {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));

    const subtotal = selectedItems.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0,
    );

    const formattedItems = selectedItems.map((item) => ({
      cartItemId: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variant: item.size,
      price: item.price,
      quantity: item.quantity,
      imageURL: item.imageURL,
    }));

    return {
      totals: {
        subtotal,
        serviceFee: 0,
        total: subtotal,
        count: selectedIds.length,
      },
      selectedItemsForSummary: formattedItems,
    };
  }, [selectedIds, items]);

  return (
    <>
      <CheckoutHeader
        step={1}
        title="Keranjang Belanja"
        description={
          items.length > 0
            ? `${items.length} Produk di keranjang Anda`
            : 'Pilih produk yang ingin Anda beli'
        }
      />

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse gap-4 rounded-2xl bg-[#fffdf8] p-5 ring-1 ring-[#e8dfd0]"
              >
                <div className="size-20 rounded-xl bg-[#efe8dd]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-[#efe8dd]" />
                  <div className="h-3 w-1/3 rounded bg-[#f4efe5]" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-[#fffdf8] ring-1 ring-[#e8dfd0] lg:col-span-4" />
        </div>
      ) : error ? (
        <ProfileEmptyState
          icon={XCircle}
          tone="error"
          title="Gagal memuat keranjang"
          description={error.message}
        />
      ) : items.length === 0 ? (
        <ProfileEmptyState
          icon={ShoppingCart}
          title="Keranjang Anda masih kosong"
          description="Temukan wastra favorit Anda dan tambahkan ke keranjang."
          action={
            <Button
              asChild
              className={cn(profilePrimaryButtonClassName, 'h-10 px-5')}
            >
              <Link href="/catalog">
                <ShoppingBag className="size-4" />
                Mulai Belanja
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="items-start gap-6 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CartList
              items={items}
              selectedIds={selectedIds}
              onToggleItem={toggleItem}
              onToggleAll={toggleAll}
              onUpdateQty={handleUpdateQuantity}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>
          <div className="mt-6 lg:sticky lg:top-6 lg:col-span-4 lg:mt-0">
            <CartSummary
              totals={totals}
              selectedItems={selectedItemsForSummary}
            />
          </div>
        </div>
      )}
    </>
  );
}
