'use client';

import { ProfileSection } from '@/components/profile/profile-section';
import { cn, formatIDR } from '@/lib/utils';
import type { ShippingOption } from '@/types/checkout';
import { Check, Clock, Truck } from 'lucide-react';

// Definisikan tipe untuk props yang diterima komponen
interface ShippingMethodSectionProps {
  options: ShippingOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ShippingMethodSection({
  options,
  selectedId,
  onSelect,
}: ShippingMethodSectionProps) {
  return (
    <ProfileSection
      icon={Truck}
      title="Metode Pengiriman"
      description="Pilih kurir sesuai kebutuhan Anda"
    >
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <label
              key={opt.id}
              className={cn(
                'group relative flex cursor-pointer flex-col gap-3 rounded-xl p-4 ring-1 transition-all duration-200',
                isSelected
                  ? 'bg-surface ring-2 ring-brand/50'
                  : 'bg-card ring-border',
              )}
            >
              <input
                type="radio"
                name="shipping-method"
                checked={isSelected}
                onChange={() => onSelect(opt.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[15px] font-semibold',
                    isSelected
                      ? 'bg-brand text-gold'
                      : 'bg-surface text-ink-soft',
                  )}
                >
                  {opt.courier}
                </span>
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full transition-all',
                    isSelected
                      ? 'bg-brand text-on-field'
                      : 'ring-2 ring-border',
                  )}
                >
                  {isSelected ? <Check className="size-3" /> : null}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-ink">{opt.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-ink-soft">
                    <Clock className="size-3" />
                    {opt.desc}
                  </p>
                </div>
                <span className="text-[15px] font-bold whitespace-nowrap text-ink">
                  {formatIDR(opt.price)}
                </span>
              </div>
              {opt.tag ? (
                <span className="absolute -top-2 right-3 rounded-full bg-brand/10 px-2.5 py-0.5 text-[13px] font-semibold text-brand">
                  {opt.tag}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </ProfileSection>
  );
}
