'use client';

import { Button } from '@/components/ui/button';
import {
  getCheckoutSession,
  setCheckoutSession,
  subscribeToCheckoutSession,
} from '@/lib/checkout-session';
import {
  type CheckoutAddressSelection,
  type CheckoutSessionData,
  type CheckoutShippingSelection,
} from '@/types/checkout';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
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
    name: 'YES (1 hari)',
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
      <div className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#8e8476]">
        <span className="text-brand">Keranjang</span>
        <span className="text-[#d8cfbf]">&gt;</span>
        <span className="text-[#3d5446] border-b-2 border-brand pb-1">
          Pengiriman
        </span>
        <span className="text-[#d8cfbf]">&gt;</span>
        <span className="text-[#d8cfbf]">Pembayaran</span>
      </div>

      {selectedItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e2d5] p-8 text-center">
          <p className="text-lg font-bold text-[#3d5446]">
            Belum ada produk checkout
          </p>
          <p className="text-[#8e8476] mt-2">
            Pilih produk dari keranjang terlebih dahulu.
          </p>
          <Link href="/cart" className="inline-block mt-6">
            <Button className="bg-[#2f5f49] hover:bg-[#244a39] text-white">
              Kembali ke Keranjang
            </Button>
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 gap-8 items-start">
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

            <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link href="/cart">
                <Button
                  variant="ghost"
                  className="text-brand font-bold gap-2 hover:bg-brand/5 px-0 sm:px-4"
                >
                  <ChevronLeft size={18} /> Kembali ke Keranjang
                </Button>
              </Link>

              <Button
                onClick={handleContinueToPayment}
                disabled={!selectedAddress}
                className="w-full sm:w-auto bg-[#2f5f49] hover:bg-[#244a39] text-white px-12 py-7 rounded-2xl font-bold shadow-lg shadow-brand/10 transition-all active:scale-95"
              >
                Tinjau & Konfirmasi
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[#8e8476] mt-4">
              <ShieldCheck size={14} />
              <p className="text-[10px] font-medium uppercase tracking-tighter">
                Pembayaran Aman & Terenkripsi
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <CheckoutSummary totals={totals} items={selectedItems} />
          </aside>
        </div>
      )}
    </>
  );
}
