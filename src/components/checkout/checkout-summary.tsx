'use client';

import { displayVariant } from '@/lib/checkout-session';
import { formatIDR } from '@/lib/utils';
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
  // The payment step already lists the items in full.
  showItems?: boolean;
}

export function CheckoutSummary({
  totals,
  items = [],
  showItems = true,
}: CheckoutSummaryProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] animate-pulse rounded-xl bg-card" />;
  }

  if (!totals) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-card">
      <h2 className="px-5 pt-5 text-xl font-semibold text-ink">Ringkasan</h2>

      <div className="p-5">
        {showItems ? (
          <div className="custom-scrollbar mb-4 max-h-[240px] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden bg-surface">
                  {item.imageURL ? (
                    <Image
                      src={item.imageURL}
                      alt={item.name}
                      width={44}
                      height={44}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="size-5 text-ink-soft" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-ink">
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-ink-soft">
                    {[displayVariant(item.variant), `${item.quantity} barang`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span className="text-[15px] font-semibold whitespace-nowrap text-ink">
                  {formatIDR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-2.5 text-[15px] text-ink-soft">
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <span className="font-semibold text-ink">
              {formatIDR(totals.subtotal || 0)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="leading-tight">
              Ongkos Kirim
              <span className="block text-[13px] text-ink-soft">
                {totals.shippingName || '-'}
              </span>
            </span>
            <span className="font-semibold whitespace-nowrap text-ink">
              {formatIDR(totals.shippingFee || 0)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Biaya Layanan</span>
            <span className="font-semibold text-ink">
              {formatIDR(totals.serviceFee || 0)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between pt-4">
          <span className="text-[15px] font-semibold text-ink-soft">
            Total Pembayaran
          </span>
          <span
            key={totals.total}
            className="animate-in text-2xl font-bold text-ink tabular-nums duration-300 fade-in"
          >
            {formatIDR(totals.total || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
