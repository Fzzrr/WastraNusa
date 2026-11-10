'use client';

import { ProfileSection } from '@/components/profile/profile-section';
import { displayVariant } from '@/lib/checkout-session';
import { formatIDR } from '@/lib/utils';
import type {
  CheckoutAddressSelection,
  CheckoutSelectedItem,
  CheckoutShippingSelection,
} from '@/types/checkout';
import { Clock, Hexagon, MapPin, PackageCheck, Truck } from 'lucide-react';
import Image from 'next/image';

interface ReviewItemsProps {
  items: CheckoutSelectedItem[];
  shipping?: CheckoutShippingSelection;
  address?: CheckoutAddressSelection;
}

export function ReviewItems({ items, shipping, address }: ReviewItemsProps) {
  return (
    <ProfileSection
      icon={PackageCheck}
      title="Pesanan Anda"
      description="Pastikan produk, alamat, dan kurir sudah sesuai"
      aside={
        <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink">
          {items.length} Produk
        </span>
      }
    >
      <div className="mb-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.cartItemId}
            className="group flex items-center gap-4 rounded-xl bg-card p-4 transition-all sm:gap-5 sm:p-5"
          >
            <div className="flex size-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft sm:size-20">
              {item.imageURL ? (
                <Image
                  src={item.imageURL}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <>
                  <Hexagon className="w-6 h-6 stroke-[1.5]" />
                  <span className="text-[13px] font-bold mt-1">Item</span>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-ink sm:text-base">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {displayVariant(item.variant) && (
                  <span className="rounded-full bg-card px-2 py-0.5 text-[13px] font-semibold text-ink">
                    {displayVariant(item.variant)}
                  </span>
                )}
                <span className="text-[13px] text-ink-soft">
                  {item.quantity} × {formatIDR(item.price)}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[13px] text-ink-soft block mb-0.5">
                Subtotal
              </span>
              <span className="text-[15px] font-bold text-ink sm:text-base">
                {formatIDR(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alamat Pengiriman */}
        <div className="flex flex-col justify-between rounded-xl bg-surface/60 p-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin
                  className="shrink-0 size-5 text-brand"
                  strokeWidth={1.75}
                />
                <h4 className="text-base font-semibold text-ink">
                  Alamat Pengiriman
                </h4>
              </div>
              {address?.label && (
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[13px] font-semibold text-brand">
                  {address.label}
                </span>
              )}
            </div>

            {address ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-base font-bold text-ink">
                    {address.recipientName}
                  </p>
                  <span className="text-[13px] text-ink-soft">
                    ({address.phone})
                  </span>
                </div>
                <p className="text-[13px] text-ink-soft leading-relaxed pt-0.5">
                  {address.fullAddress}
                </p>
                <p className="text-[13px] text-ink-soft font-medium">
                  {address.city}, {address.province} {address.postalCode}
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-destructive leading-relaxed">
                Alamat belum dipilih. Silakan kembali ke halaman checkout untuk
                memilih alamat pengiriman.
              </p>
            )}
          </div>
        </div>

        {/* Metode Pengiriman */}
        <div className="flex flex-col justify-between rounded-xl bg-surface/60 p-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck
                  className="shrink-0 size-5 text-ink"
                  strokeWidth={1.75}
                />
                <h4 className="text-base font-semibold text-ink">
                  Metode Pengiriman
                </h4>
              </div>
              <span className="px-2 py-0.5 text-[15px] font-semibold rounded-md bg-surface text-ink-soft">
                {shipping?.courier ?? 'Kurir'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-ink">
                  {shipping?.courier ?? '-'} - {shipping?.service ?? '-'}
                </p>
                {shipping?.price !== undefined && (
                  <span className="text-[15px] font-semibold text-ink">
                    {formatIDR(shipping.price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[13px] text-ink-soft mt-4 pt-3 border-t border-border">
            <Clock className="size-3.5 text-ink-soft shrink-0" />
            <span>
              Estimasi tiba:{' '}
              <strong className="font-semibold text-ink">
                {shipping?.description ?? '-'}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
