'use client';

import { profilePrimaryButtonClassName } from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { KawungPattern } from '@/components/wastra-hero';
import { setCheckoutSession } from '@/lib/checkout-session';
import { formatIDR } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  type CheckoutSelectedItem,
  type CheckoutSessionData,
} from '@/types/checkout';
import {
  ArrowRight,
  MousePointerClick,
  Package,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartSummaryProps {
  totals: {
    count: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  };
  selectedItems?: CheckoutSelectedItem[];
}

export function CartSummary({ totals, selectedItems = [] }: CartSummaryProps) {
  const isCartEmpty = totals.count === 0;
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleGoToCheckout = () => {
    if (isCartEmpty) return;

    const payload: CheckoutSessionData = {
      items: selectedItems,
      createdAt: new Date().toISOString(),
    };

    setCheckoutSession(payload);
    router.push('/cart/checkout');
  };

  if (!mounted) {
    return (
      <div className="h-[350px] animate-pulse rounded-2xl bg-[#fffdf8] ring-1 ring-[#e8dfd0]" />
    );
  }

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
            {totals.count} Produk
          </span>
        </div>
      </div>

      <div className="p-5">
        {!isCartEmpty && selectedItems.length > 0 ? (
          <div className="custom-scrollbar mb-4 max-h-[220px] space-y-3 overflow-y-auto pr-1">
            {selectedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex animate-in items-center gap-3 fade-in slide-in-from-right-1"
              >
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
                  <p className="mt-0.5 text-[11px] text-[#9a8f80]">
                    {item.variant || 'Default'} · ×{item.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold whitespace-nowrap text-[#2f4f3f]">
                  {formatIDR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#e0d6c6] bg-[#faf7f2] px-4 py-6 text-center">
            <MousePointerClick className="size-5 text-[#b08a5e]" />
            <p className="text-xs text-[#9a8f80]">
              Centang produk di keranjang untuk melihat ringkasan.
            </p>
          </div>
        )}

        <div className="flex items-end justify-between border-t border-dashed border-[#e3d9c7] pt-4">
          <span className="text-sm font-semibold text-[#6f6a62]">
            Estimasi Total
          </span>
          <span
            key={totals.total}
            className="animate-in text-xl font-extrabold text-[#2f5f49] duration-300 fade-in"
          >
            {formatIDR(totals.total || 0)}
          </span>
        </div>
        <p className="mt-1 text-right text-[11px] text-[#9a8f80]">
          Belum termasuk ongkir & biaya layanan
        </p>

        <Button
          disabled={isCartEmpty}
          onClick={handleGoToCheckout}
          className={cn(
            profilePrimaryButtonClassName,
            'group/cta mt-5 h-12 w-full text-base font-bold active:scale-[0.98] disabled:opacity-50',
          )}
        >
          Checkout
          <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
        </Button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#9a8f80]">
          <ShieldCheck className="size-3.5 text-[#2f5f49]" />
          Pembayaran aman & terenkripsi
        </p>
      </div>
    </div>
  );
}
