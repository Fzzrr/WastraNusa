'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { displayVariant } from '@/lib/checkout-session';
import { cn, formatIDR } from '@/lib/utils';
import { Hexagon, MapPin, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

import type { CartProduct } from './cart-list';

interface CartItemProps {
  item: CartProduct;
  index?: number;
  isSelected: boolean;
  onToggle: () => void;
  onUpdateQty: (delta: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  index = 0,
  isSelected,
  onToggle,
  onUpdateQty,
  onRemove,
}: CartItemProps) {
  const isAtMin = item.quantity <= 1;
  const isAtMax = item.quantity >= item.stock;

  return (
    <div
      className={cn(
        'group flex animate-in gap-4 rounded-xl p-4 ring-1 transition-all duration-300 fill-mode-both fade-in slide-in-from-bottom-1 md:gap-5 md:p-5',
        isSelected ? 'bg-surface ring-2 ring-brand/40' : 'bg-card ring-border',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Padding widens the 16px checkbox to a ~40px tap target. */}
      <label className="-m-3 flex cursor-pointer items-center p-3">
        <Checkbox
          checked={isSelected}
          onChange={onToggle}
          disabled={item.stock <= 0}
          aria-label={`Pilih ${item.name}`}
        />
      </label>

      <div className="flex size-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft md:size-24">
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
            <span className="mt-1 text-[13px] font-semibold">
              {item.clothingType}
            </span>
          </>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold text-ink">
            {item.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-ink-soft" />
              {item.province}
            </span>
            {displayVariant(item.size) ? (
              <span className="font-semibold text-ink">
                {displayVariant(item.size)}
              </span>
            ) : null}
            <span
              className={cn(
                'inline-flex items-center gap-1',
                item.stock <= 5 && 'font-semibold text-ink-soft',
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  item.stock <= 5 ? 'bg-amber-500' : 'bg-[#3f8f63]',
                )}
              />
              {item.stock > 0 ? `Stok: ${item.stock}` : 'Stok habis'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:flex-col sm:flex-nowrap sm:items-end sm:gap-2">
          <div className="text-left sm:text-right">
            <p className="text-base font-bold text-ink tabular-nums">
              {formatIDR(item.price)}
            </p>
            {item.quantity > 1 ? (
              <p className="text-[13px] text-ink-soft">
                Subtotal {formatIDR(item.price * item.quantity)}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Hapus ${item.name} dari keranjang`}
              onClick={onRemove}
              className="grid size-10 cursor-pointer place-items-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </button>
            <div className="flex h-11 items-center gap-1 rounded-full bg-surface p-1">
              <button
                type="button"
                aria-label="Kurangi jumlah"
                onClick={() => onUpdateQty(-1)}
                disabled={isAtMin}
                className="grid size-9 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-7 text-center text-[15px] font-semibold text-ink tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Tambah jumlah"
                onClick={() => onUpdateQty(1)}
                disabled={isAtMax}
                className="grid size-9 cursor-pointer place-items-center rounded-full bg-brand text-on-field transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
