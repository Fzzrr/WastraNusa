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

  return (
    <div className="space-y-4">
      {/* Header Pilih Semua */}
      <div className="bg-white rounded-xl border border-[#e8e2d5] p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Checkbox id="all" checked={isAllSelected} onChange={onToggleAll} />
          <label
            htmlFor="all"
            className="cursor-pointer text-sm font-bold text-[#455c4d]"
          >
            Pilih semua
          </label>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 h-auto p-2"
            onClick={onDeleteSelected}
          >
            <Trash2 size={14} /> Hapus
          </Button>
        )}
      </div>

      {/* Render Produk tanpa Grup */}
      <div className="bg-white rounded-2xl border border-[#e8e2d5] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#f0ede6]">
          {items.map((product) => (
            <CartItem
              key={product.id}
              item={product}
              isSelected={selectedIds.includes(product.id)}
              onToggle={() => onToggleItem(product.id)}
              onUpdateQty={(delta: number) => onUpdateQty(product.id, delta)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
