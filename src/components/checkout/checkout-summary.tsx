'use client';

import { KawungPattern } from '@/components/wastra-hero';
import { formatIDR } from '@/lib/utils';
import type { CheckoutSelectedItem } from '@/types/checkout';
import { Package, Receipt } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CheckoutSummaryProps {
  totals: {
    subtotal: number;
    shippingFee: number;
    serviceFee: number;
    total: number;
    shippingName: string;
  };
  items?: CheckoutSelectedItem[];
}

export function CheckoutSummary({ totals, items = [] }: CheckoutSummaryProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] animate-pulse rounded-2xl bg-[#fffdf8] ring-1 ring-[#e8dfd0]" />
    );
  }

  if (!totals) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#fffdf8] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.08)] ring-1 ring-[#e8dfd0]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f5e48] to-[#244a39] px-5 py-4 text-white">
        <KawungPattern className="inset-0 size-full text-[#e8cb8d] opacity-[0.07]" />
        <div className="relative flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold">
            <Receipt className="size-4 text-[#e8cb8d]" />
            Ringkasan Pesanan
          </h3>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
            {items.length} Produk
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="custom-scrollbar mb-4 max-h-[240px] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eadecb] ring-1 ring-[#e8e2d5]">
                {item.imageURL ? (
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="size-full object-cover"
                  />
                ) : (
                  <Package className="size-5 text-[#8e8476]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#2f4f3f]">
                  {item.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[#9a8f80]">
                  {item.variant || 'Default'} · ×{item.quantity} Barang
                </p>
              </div>
              <span className="text-xs font-bold whitespace-nowrap text-[#2f4f3f]">
                {formatIDR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 rounded-xl bg-[#faf7f2] p-3.5 text-xs text-[#6f6a62] ring-1 ring-[#efe8dd]">
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <span className="font-semibold text-[#2f4f3f]">
              {formatIDR(totals.subtotal || 0)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="leading-tight">
              Ongkos Kirim
              <span className="block text-[10px] text-[#9a8f80]">
                {totals.shippingName || '-'}
              </span>
            </span>
            <span className="font-semibold whitespace-nowrap text-[#2f4f3f]">
              {formatIDR(totals.shippingFee || 0)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Biaya Layanan</span>
            <span className="font-semibold text-[#2f4f3f]">
              {formatIDR(totals.serviceFee || 0)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-dashed border-[#e3d9c7] pt-4">
          <span className="text-sm font-semibold text-[#6f6a62]">
            Total Pembayaran
          </span>
          <span
            key={totals.total}
            className="animate-in text-xl font-extrabold text-[#2f5f49] duration-300 fade-in"
          >
            {formatIDR(totals.total || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
