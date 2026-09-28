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
}

export function CartList({
  items,
  selectedIds,
  onToggleItem,
  onToggleAll,
  onUpdateQty,
  onDeleteSelected,
}: CartListProps) {
  // Tidak lagi menggunakan ': any'
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fffdf8] px-4 py-3 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_8px_24px_rgba(89,69,38,0.06)] ring-1 ring-[#e8dfd0]">
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            id="all"
            aria-label="Pilih Semua"
            checked={isAllSelected}
            onChange={onToggleAll}
          />
          <span className="text-sm font-bold text-[#2f4f3f]">
            Pilih Semua ({items.length})
          </span>
        </label>
        {selectedCount > 0 ? (
          <div className="flex animate-in items-center gap-3 fade-in zoom-in-95">
            <span className="hidden text-xs text-[#9a8f80] sm:inline">
              {selectedCount} Dipilih
            </span>
            <Button
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 rounded-xl border-[#f0cfc7] bg-white px-3 text-xs font-bold text-[#b04a3a] hover:bg-[#f6e1dd] hover:text-[#9a3b2d]"
              onClick={onDeleteSelected}
            >
              <Trash2 className="size-3.5" /> Hapus
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
          />
        ))}
      </div>
    </div>
  );
}
