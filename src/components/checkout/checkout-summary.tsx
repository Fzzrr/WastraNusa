'use client';

import type { CheckoutSelectedItem } from '@/types/checkout';
import { Package } from 'lucide-react';
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
      <div className="bg-white rounded-2xl border border-[#e8e2d5] p-6 shadow-sm animate-pulse h-[400px]">
        <div className="flex justify-between mb-6">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-12 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!totals) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#e8e2d5] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-[#3d5446] text-sm">Ringkasan Pesanan</h3>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f0ede6] text-[#5c7365]">
          {items.length} Produk
        </span>
      </div>

      <div className="space-y-4 mb-6 max-h-[240px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.cartItemId} className="flex gap-4 items-center">
            <div className="w-11 h-11 bg-[#eadecb] rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
              {item.imageURL ? (
                <Image
                  src={item.imageURL}
                  alt={item.name}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-5 h-5 text-[#8e8476]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#3d5446] truncate">
                {item.name}
              </p>
              <p className="text-[11px] text-[#726759] mt-0.5 truncate">
                {item.variant || 'Default'} {' | '} x {item.quantity} barang
              </p>
            </div>
            <span className="text-xs font-bold text-[#3d5446] whitespace-nowrap">
              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-[#f0ede6] mb-5" />

      <div className="space-y-3 text-[11px] text-[#3d5446]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold">
            Rp {(totals.subtotal || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="leading-tight shrink">
            Ongkos Kirim ({totals.shippingName || '-'})
          </span>
          <span className="font-bold whitespace-nowrap">
            Rp {(totals.shippingFee || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Biaya Layanan</span>
          <span className="font-bold">
            Rp {(totals.serviceFee || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <hr className="border-[#f0ede6] my-5" />

      <div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[#3d5446]">
            Total Pembayaran
          </span>
          <span className="text-base font-extrabold text-[#3d5446]">
            Rp {(totals.total || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}
