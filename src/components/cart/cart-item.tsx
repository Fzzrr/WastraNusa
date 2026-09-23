'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { formatIDR } from '@/lib/utils';
import { Hexagon, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CartItem({ item, isSelected, onToggle, onUpdateQty }: any) {
  return (
    <div
      className={`p-5 flex gap-5 transition-colors ${isSelected ? 'bg-brand/5' : 'bg-white'}`}
    >
      {/* Checkbox Produk */}
      <div className="flex items-center">
        <Checkbox checked={isSelected} onChange={onToggle} />
      </div>

      {/* Gambar */}
      <div className="w-20 h-20 shrink-0 bg-[#f4efe6] border border-[#e8e2d5] rounded-xl overflow-hidden flex flex-col items-center justify-center text-[#8e8476]">
        {item.imageURL ? (
          <Image
            src={item.imageURL}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Hexagon className="w-7 h-7 stroke-[1.5]" />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
              {item.clothingType}
            </span>
          </>
        )}
      </div>

      {/* Info Detail */}
      <div className="flex-1 flex justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-[#3d5446] text-sm leading-tight hover:text-brand cursor-pointer">
            {item.name}
          </h3>
          <p className="text-[11px] text-[#8e8476] mt-1 italic">
            {item.province}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="px-2 py-0.5 bg-[#f0ede6] rounded text-[10px] font-bold text-[#726759]">
              Size {item.size}
            </span>
            <span className="text-[10px] text-[#aca493]">
              Stok: {item.stock}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <p className="font-bold text-brand text-[15px]">
            {formatIDR(item.price)}
          </p>
          <div className="flex items-center border border-[#d8cfbf] rounded-lg overflow-hidden h-8 bg-white shadow-sm">
            <button
              onClick={() => onUpdateQty(-1)}
              className="px-2.5 bg-[#fbf8f2] hover:bg-[#f0ede6] text-[#455c4d] border-r border-[#d8cfbf] transition-colors"
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <input
              type="text"
              value={item.quantity}
              className="w-9 text-center text-xs font-extrabold text-[#3d5446] bg-transparent outline-none"
              readOnly
            />
            <button
              onClick={() => onUpdateQty(1)}
              className="px-2.5 bg-[#fbf8f2] hover:bg-[#f0ede6] text-[#455c4d] border-l border-[#d8cfbf] transition-colors"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
