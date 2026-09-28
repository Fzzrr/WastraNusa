'use client';

import { CheckoutHeader } from '@/components/checkout/checkout-stepper';
import {
  ProfileEmptyState,
  profileOutlineButtonClassName,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/hooks/use-checkout';
import {
  getCheckoutSession,
  subscribeToCheckoutSession,
} from '@/lib/checkout-session';
import { cn } from '@/lib/utils';
import type {
  CheckoutSessionData,
  CheckoutShippingSelection,
} from '@/types/checkout';
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { CheckoutSummary } from '../checkout-summary';
import { ReviewItems } from './review-items';

const defaultShipping: CheckoutShippingSelection = {
  id: 'sic',
  courier: 'SiCepat',
  service: 'Reguler',
  price: 16000,
  description: '2-4 hari kerja',
};

export function PaymentMain() {
  const sessionData = useSyncExternalStore(
    subscribeToCheckoutSession,
    getCheckoutSession,
    () => null,
  ) as CheckoutSessionData | null;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { mutateAsync: checkout, isPending: isSubmitting } = useCheckout();
  const isProcessing = isSubmitting || isRedirecting;

  const items = useMemo(() => sessionData?.items ?? [], [sessionData]);
  const shipping = useMemo(
    () => sessionData?.shipping ?? defaultShipping,
    [sessionData],
  );
  const address = useMemo(() => sessionData?.address, [sessionData]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const serviceFee = items.length > 0 ? 5000 : 0;
    const shippingFee = shipping.price;

    return {
      subtotal,
      shippingFee,
      serviceFee,
      total: subtotal + shippingFee + serviceFee,
      shippingName: `${shipping.courier} (${shipping.service})`,
    };
  }, [items, shipping]);

  const handleConfirmAndPay = async () => {
    if (items.length === 0 || isProcessing) return;

    setErrorMessage(null);
    setIsRedirecting(true);

    try {
      const result = await checkout({
        items: items.map((item) => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          frontendPrice: item.price,
        })),
        shippingAddressId: address?.id,
        shippingCost: shipping.price,
        courier: shipping.courier,
        courierService: shipping.service,
        estimatedDelivery: shipping.description,
      });

      window.location.href = result.redirect_url;
    } catch (error) {
      setIsRedirecting(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat checkout',
      );
    }
  };

  return (
    <>
      <CheckoutHeader
        step={3}
        title="Pembayaran"
        description="Periksa kembali pesanan sebelum membayar"
      />

      {items.length === 0 ? (
        <ProfileEmptyState
          icon={ShoppingCart}
          title="Belum ada data checkout"
          description="Kembali ke keranjang dan pilih produk terlebih dahulu."
          action={
            <Button
              asChild
              className={cn(profilePrimaryButtonClassName, 'h-10 px-5')}
            >
              <Link href="/cart">Kembali ke Keranjang</Link>
            </Button>
          }
        />
      ) : (
        <div className="items-start gap-6 lg:grid lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <ReviewItems items={items} shipping={shipping} address={address} />

            {errorMessage && (
              <div className="flex animate-in items-start gap-3 rounded-xl border border-[#f0cfc7] bg-[#fbf1eb] p-4 text-sm text-[#9a3b2d] fade-in">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#e8dfd0] sm:flex-row">
              <Button
                asChild
                variant="outline"
                className={cn(
                  profileOutlineButtonClassName,
                  'h-11 w-full px-5 font-bold sm:w-auto',
                )}
              >
                <Link href="/cart/checkout">
                  <ChevronLeft className="size-4" /> Kembali
                </Link>
              </Button>

              <Button
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="group/pay h-12 w-full cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-[#cc6644] to-[#d98b52] px-8 text-base font-bold text-white shadow-[0_12px_24px_-12px_rgba(204,102,68,0.9)] transition-all hover:-translate-y-px hover:from-[#b3593b] hover:to-[#c97a45] active:scale-95 disabled:opacity-70 sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" /> Konfirmasi & Bayar
                    Sekarang
                    <ArrowRight className="size-4 transition-transform group-hover/pay:translate-x-1" />
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#9a8f80]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#2f5f49]" />
                Pembayaran aman & terenkripsi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-[#2f5f49]" />
                Diproses oleh Midtrans
              </span>
            </div>
          </div>

          <aside className="mt-6 lg:sticky lg:top-6 lg:col-span-4 lg:mt-0">
            <CheckoutSummary totals={totals} items={items} />
          </aside>
        </div>
      )}
    </>
  );
}
