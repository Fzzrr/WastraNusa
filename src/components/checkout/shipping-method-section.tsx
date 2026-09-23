'use client';

import { formatIDR } from '@/lib/utils';
import { Truck } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-[#e8e2d5] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-[#3d5446] flex items-center gap-2 mb-6">
        <Truck size={18} className="text-brand" /> Metode Pengiriman
      </h3>

      <div className="space-y-3">
        {/* Tidak perlu lagi opt: any, TypeScript sudah tahu dari interface di atas */}
        {options.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
              selectedId === opt.id
                ? 'border-brand bg-brand/5'
                : 'border-[#e8e2d5] bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                checked={selectedId === opt.id}
                onChange={() => onSelect(opt.id)}
                className="accent-brand h-4 w-4"
              />
              <div className="w-20 h-10 flex items-center justify-center bg-[#fbf8f2] border border-[#e8e2d5] rounded text-[10px] font-extrabold text-[#8e8476] uppercase">
                {opt.courier}
              </div>
              <div>
                <p className="text-xs font-bold text-[#3d5446]">{opt.name}</p>
                <p className="text-[10px] text-[#8e8476]">{opt.desc}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#3d5446]">
              {formatIDR(opt.price)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
