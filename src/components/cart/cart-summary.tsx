'use client';

import { Button } from '@/components/ui/button';
import { setCheckoutSession } from '@/lib/checkout-session';
import {
  type CheckoutSelectedItem,
  type CheckoutSessionData,
} from '@/types/checkout';
import { Package } from 'lucide-react';
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
      <div className="bg-white rounded-2xl border border-[#e8e2d5] p-6 shadow-sm animate-pulse h-[350px]"></div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e2d5] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#3d5446]">Ringkasan Pesanan</h3>
      </div>

      <hr className="border-[#f0ede6] mb-5" />

      {!isCartEmpty && selectedItems.length > 0 && (
        <>
          <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
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
                  <p className="truncate text-xs font-bold text-[#3d5446]">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#3d5446]">
                    {item.variant || 'M'} - x{item.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#3d5446] whitespace-nowrap">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="border-[#f0ede6] my-5" />

      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[#3d5446]">Estimasi Total</span>
        <span className="text-sm font-bold text-[#3d5446]">
          Rp {(totals.total || 0).toLocaleString('id-ID')}
        </span>
      </div>

      <div className="mt-6">
        <Button
          disabled={isCartEmpty}
          onClick={handleGoToCheckout}
          className="w-full bg-[#2f5f49] hover:bg-[#244a39] text-white py-6 rounded-xl font-bold shadow-md shadow-brand/10 transition-all active:scale-[0.98]"
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
