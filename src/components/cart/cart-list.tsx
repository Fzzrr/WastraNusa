'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

import { CartItem } from './cart-item';

// 1. Definisi Tipe Data Produk agar TypeScript tidak komplain 'any'
export interface CartProduct {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  size: string;
  stock: number;
  quantity: number;
  clothingType: string;
  province: string;
  imageURL?: string | null;
}

// 2. Definisi Tipe Data untuk Props Komponen
interface CartListProps {
  items: CartProduct[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onToggleAll: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onDeleteSelected: () => void;
  onRemoveItem: (id: string) => void;
}

export function CartList({
  items,
  selectedIds,
  onToggleItem,
  onToggleAll,
  onUpdateQty,
  onDeleteSelected,
  onRemoveItem,
}: CartListProps) {
  const selectableCount = items.filter((item) => item.stock > 0).length;
  const isAllSelected =
    selectableCount > 0 && selectedIds.length === selectableCount;

  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            id="all"
            aria-label="Pilih Semua"
            checked={isAllSelected}
            onChange={onToggleAll}
          />
          <span className="text-[15px] font-bold text-ink">
            Pilih Semua ({items.length})
          </span>
        </label>
        {selectedCount > 0 ? (
          <div className="flex animate-in items-center gap-3 fade-in zoom-in-95">
            <span className="hidden text-[13px] text-ink-soft sm:inline">
              {selectedCount} dipilih
            </span>
            <Button
              variant="outline"
              className="h-10 cursor-pointer gap-1.5 rounded-full border-0 bg-transparent px-4 text-[15px] font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDeleteSelected}
            >
              <Trash2 className="size-4" /> Hapus
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {items.map((product, index) => (
          <CartItem
            key={product.id}
            item={product}
            index={index}
            isSelected={selectedIds.includes(product.id)}
            onToggle={() => onToggleItem(product.id)}
            onUpdateQty={(delta: number) => onUpdateQty(product.id, delta)}
            onRemove={() => onRemoveItem(product.id)}
          />
        ))}
      </div>
    </div>
  );
}
