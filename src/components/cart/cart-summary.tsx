'use client';

import { profilePrimaryButtonClassName } from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { displayVariant, setCheckoutSession } from '@/lib/checkout-session';
import { formatIDR } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  type CheckoutSelectedItem,
  type CheckoutSessionData,
} from '@/types/checkout';
import { ArrowRight, MousePointerClick, Package } from 'lucide-react';
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
    return <div className="h-[350px] animate-pulse rounded-xl bg-card" />;
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card">
      <h2 className="px-5 pt-5 text-xl font-semibold text-ink">Ringkasan</h2>

      <div className="p-5">
        {!isCartEmpty && selectedItems.length > 0 ? (
          <div className="custom-scrollbar mb-4 max-h-[220px] space-y-3 overflow-y-auto pr-1">
            {selectedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex animate-in items-center gap-3 fade-in slide-in-from-right-1"
              >
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
                  <p className="mt-0.5 text-[13px] text-ink-soft">
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
        ) : (
          <div className="mb-4 flex flex-col items-center gap-2 bg-surface px-4 py-6 text-center">
            <MousePointerClick className="size-5 text-ink-soft" />
            <p className="text-[13px] text-ink-soft">
              Centang produk di keranjang untuk melihat ringkasan.
            </p>
          </div>
        )}

        <div className="flex items-end justify-between pt-4">
          <span className="text-[15px] font-semibold text-ink-soft">
            Estimasi Total
          </span>
          <span
            key={totals.total}
            className="animate-in text-2xl font-bold text-ink tabular-nums duration-300 fade-in"
          >
            {formatIDR(totals.total || 0)}
          </span>
        </div>
        <p className="mt-1 text-right text-[13px] text-ink-soft">
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
      </div>
    </div>
  );
}
