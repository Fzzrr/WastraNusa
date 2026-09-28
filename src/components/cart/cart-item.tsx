'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn, formatIDR } from '@/lib/utils';
import { Hexagon, MapPin, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

import type { CartProduct } from './cart-list';

interface CartItemProps {
  item: CartProduct;
  index?: number;
  isSelected: boolean;
  onToggle: () => void;
  onUpdateQty: (delta: number) => void;
}

export function CartItem({
  item,
  index = 0,
  isSelected,
  onToggle,
  onUpdateQty,
}: CartItemProps) {
  const isAtMin = item.quantity <= 1;
  const isAtMax = item.quantity >= item.stock;

  return (
    <div
      className={cn(
        'group flex animate-in gap-4 rounded-2xl p-4 ring-1 transition-all duration-300 fill-mode-both fade-in slide-in-from-bottom-1 md:gap-5 md:p-5',
        isSelected
          ? 'bg-gradient-to-r from-[#e3ece5] to-[#fffdf8] ring-2 ring-[#2f5f49]/40'
          : 'bg-[#fffdf8] ring-[#e8dfd0] hover:shadow-[0_16px_32px_-22px_rgba(89,69,38,0.45)] hover:ring-[#caa86a]/50',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center">
        <Checkbox
          checked={isSelected}
          onChange={onToggle}
          aria-label={`Pilih ${item.name}`}
        />
      </div>

      <div className="flex size-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-[#f4efe6] text-[#8e8476] ring-1 ring-[#e8e2d5] md:size-24">
        {item.imageURL ? (
          <Image
            src={item.imageURL}
            alt={item.name}
            width={96}
            height={96}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <>
            <Hexagon className="size-7 stroke-[1.5]" />
            <span className="mt-1 text-[9px] font-bold tracking-wider uppercase">
              {item.clothingType}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#f5ead3] px-2 py-0.5 text-[10px] font-semibold text-[#8a6a2a]">
            {item.clothingType}
          </span>
          <h3 className="mt-1 leading-tight font-bold text-[#2f4f3f]">
            {item.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#9a8f80]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-[#b08a5e]" />
              {item.province}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[#4d6356] ring-1 ring-[#e3d9c7]">
              Size {item.size}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1',
                item.stock <= 5 && 'font-semibold text-[#a0702a]',
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  item.stock <= 5 ? 'bg-amber-500' : 'bg-[#3f8f63]',
                )}
              />
              Stok: {item.stock}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
          <div className="text-left sm:text-right">
            <p className="text-base font-extrabold text-[#2f5f49]">
              {formatIDR(item.price)}
            </p>
            {item.quantity > 1 ? (
              <p className="text-[11px] text-[#9a8f80]">
                Subtotal {formatIDR(item.price * item.quantity)}
              </p>
            ) : null}
          </div>
          <div className="flex h-9 items-center gap-1 rounded-full bg-white p-1 ring-1 ring-[#e3d9c7]">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              onClick={() => onUpdateQty(-1)}
              disabled={isAtMin}
              className="grid size-7 cursor-pointer place-items-center rounded-full text-[#2f5f49] transition-colors hover:bg-[#e3ece5] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <span className="w-7 text-center text-sm font-extrabold text-[#2f4f3f] tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Tambah jumlah"
              onClick={() => onUpdateQty(1)}
              disabled={isAtMax}
              className="grid size-7 cursor-pointer place-items-center rounded-full bg-[#2f5f49] text-white transition-colors hover:bg-[#244a39] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
