'use client';

import { CheckoutHeader } from '@/components/checkout/checkout-stepper';
import {
  ProfileEmptyState,
  profileOutlineButtonClassName,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import {
  getCheckoutSession,
  setCheckoutSession,
  subscribeToCheckoutSession,
} from '@/lib/checkout-session';
import { cn } from '@/lib/utils';
import {
  type CheckoutAddressSelection,
  type CheckoutSessionData,
  type CheckoutShippingSelection,
} from '@/types/checkout';
import {
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { AddressSection } from './address-section';
import { CheckoutSummary } from './checkout-summary';
import { ShippingMethodSection } from './shipping-method-section';

const shippingOptions = [
  {
    id: 'sic',
    name: 'Reguler',
    courier: 'SiCepat',
    price: 16000,
    desc: '2-4 hari kerja',
    tag: 'Hemat',
  },
  {
    id: 'jne-reg',
    name: 'Reguler (REG)',
    courier: 'JNE',
    price: 18000,
    desc: '3-5 hari kerja',
  },
  {
    id: 'jne-yes',
    name: 'YES (1 Hari)',
    courier: 'JNE',
    price: 42000,
    desc: '1 hari kerja',
  },
  {
    id: 'gosend',
    name: 'Same Day',
    courier: 'GoSend',
    price: 56000,
    desc: 'Hari ini (max 8 jam)',
    tag: 'Dalam kota',
  },
];

export function CheckoutMain() {
  const router = useRouter();
  const sessionData = useSyncExternalStore(
    subscribeToCheckoutSession,
    getCheckoutSession,
    () => null,
  ) as CheckoutSessionData | null;
  const [selectedShippingIdState, setSelectedShippingId] = useState<
    string | null
  >(null);
  const [selectedAddressState, setSelectedAddress] =
    useState<CheckoutAddressSelection | null>(null);
  const selectedShippingId =
    selectedShippingIdState ?? sessionData?.shipping?.id ?? 'sic';
  const selectedAddress = selectedAddressState ?? sessionData?.address ?? null;

  const selectedShipping = useMemo(
    () =>
      shippingOptions.find((opt) => opt.id === selectedShippingId) ??
      shippingOptions[0],
    [selectedShippingId],
  );

  const selectedItems = useMemo(() => sessionData?.items ?? [], [sessionData]);

  const totals = useMemo(() => {
    const subtotal = selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const serviceFee = selectedItems.length > 0 ? 5000 : 0;
    const shippingFee = selectedShipping?.price ?? 0;

    return {
      subtotal,
      shippingFee,
      serviceFee,
      total: subtotal + shippingFee + serviceFee,
      shippingName: selectedShipping
        ? `${selectedShipping.courier} (${selectedShipping.name})`
        : '-',
    };
  }, [selectedItems, selectedShipping]);

  const handleContinueToPayment = () => {
    if (!sessionData || !selectedShipping || !selectedAddress) return;

    const shippingSelection: CheckoutShippingSelection = {
      id: selectedShipping.id,
      courier: selectedShipping.courier,
      service: selectedShipping.name,
      price: selectedShipping.price,
      description: selectedShipping.desc,
    };

    const payload: CheckoutSessionData = {
      ...sessionData,
      shipping: shippingSelection,
      address: selectedAddress,
    };

    setCheckoutSession(payload);
    router.push('/cart/checkout/payment');
  };

  return (
    <>
      <CheckoutHeader
        step={2}
        title="Pengiriman"
        description="Pilih alamat tujuan dan metode pengiriman"
      />

      {selectedItems.length === 0 ? (
        <ProfileEmptyState
          icon={ShoppingCart}
          title="Belum ada produk checkout"
          description="Pilih produk dari keranjang terlebih dahulu."
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
          <div className="lg:col-span-8 space-y-6">
            <AddressSection
              initialSelectedAddressId={selectedAddress?.id}
              onSelectAddress={setSelectedAddress}
            />
            <ShippingMethodSection
              options={shippingOptions}
              selectedId={selectedShippingId}
              onSelect={setSelectedShippingId}
            />

            <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#e8dfd0] sm:flex-row">
              <Link href="/cart">
                <Button
                  variant="outline"
                  className={cn(
                    profileOutlineButtonClassName,
                    'h-11 px-5 font-bold',
                  )}
                >
                  <ChevronLeft size={18} /> Kembali ke Keranjang
                </Button>
              </Link>

              <Button
                onClick={handleContinueToPayment}
                disabled={!selectedAddress}
                className={cn(
                  profilePrimaryButtonClassName,
                  'group/cta h-12 w-full px-8 text-base font-bold active:scale-95 disabled:opacity-50 sm:w-auto',
                )}
              >
                Tinjau & Konfirmasi
                <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[#9a8f80]">
              <ShieldCheck className="size-3.5 text-[#2f5f49]" />
              <p className="text-[11px] font-medium">
                Pembayaran Aman & Terenkripsi
              </p>
            </div>
          </div>

          <aside className="mt-6 lg:sticky lg:top-6 lg:col-span-4 lg:mt-0">
            <CheckoutSummary totals={totals} items={selectedItems} />
          </aside>
        </div>
      )}
    </>
  );
}
