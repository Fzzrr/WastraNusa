'use client';

import { ProfileSection } from '@/components/profile/profile-section';
import { cn, formatIDR } from '@/lib/utils';
import { Check, Clock, Truck } from 'lucide-react';

// 1. Definisikan tipe untuk masing-masing opsi kurir
export interface ShippingOption {
  id: string;
  name: string;
  courier: string;
  price: number;
  desc: string;
  tag?: string; // Boleh ada boleh tidak (optional)
}

// 2. Definisikan tipe untuk props yang diterima komponen
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
                  ? 'bg-gradient-to-br from-[#e3ece5] to-[#fffdf8] ring-2 ring-[#2f5f49]/50 shadow-[0_10px_24px_-16px_rgba(47,95,73,0.7)]'
                  : 'bg-white ring-[#efe8dd] hover:-translate-y-0.5 hover:ring-[#caa86a]/50',
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
                    'rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase',
                    isSelected
                      ? 'bg-[#2f5f49] text-[#e8cb8d]'
                      : 'bg-[#f4efe5] text-[#8a6a3a]',
                  )}
                >
                  {opt.courier}
                </span>
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full transition-all',
                    isSelected
                      ? 'bg-[#2f5f49] text-white'
                      : 'ring-2 ring-[#e3d9c7]',
                  )}
                >
                  {isSelected ? <Check className="size-3" /> : null}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#2f4f3f]">{opt.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[#9a8f80]">
                    <Clock className="size-3" />
                    {opt.desc}
                  </p>
                </div>
                <span className="text-sm font-extrabold whitespace-nowrap text-[#2f5f49]">
                  {formatIDR(opt.price)}
                </span>
              </div>
              {opt.tag ? (
                <span className="absolute -top-2 right-3 rounded-full bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] px-2 py-0.5 text-[10px] font-bold text-[#3c2e14] shadow-sm">
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
