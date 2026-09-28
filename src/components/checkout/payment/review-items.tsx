'use client';

import { ProfileSection } from '@/components/profile/profile-section';
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
        <span className="rounded-full bg-[#e3ece5] px-2.5 py-1 text-xs font-semibold text-[#2f5f49]">
          {items.length} Produk
        </span>
      }
    >
      <div className="mb-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.cartItemId}
            className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#efe8dd] transition-all hover:shadow-[0_16px_32px_-22px_rgba(89,69,38,0.45)] hover:ring-[#caa86a]/50 sm:gap-5 sm:p-5"
          >
            <div className="flex size-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-[#f4efe6] text-[#8e8476] ring-1 ring-[#e8e2d5] sm:size-20">
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
                  <span className="text-[8px] font-bold mt-1 uppercase">
                    Item
                  </span>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="truncate text-sm leading-snug font-bold text-[#2f4f3f] sm:text-base sm:whitespace-normal">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {item.variant && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#4d6356] ring-1 ring-[#e3d9c7]">
                    {item.variant}
                  </span>
                )}
                <span className="text-xs text-[#8e8476]">
                  {item.quantity} × {formatIDR(item.price)}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-[#8e8476] block mb-0.5">
                Total
              </span>
              <span className="text-sm font-extrabold text-[#2f5f49] sm:text-base">
                {formatIDR(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alamat Pengiriman */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#e3ece5]/60 to-[#fffdf8] p-5 ring-1 ring-[#d5e2d8]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#2f5f49] text-[#e8cb8d]">
                  <MapPin className="size-4" />
                </div>
                <h4 className="text-xs font-bold text-[#3d5446] uppercase tracking-wider">
                  Alamat Pengiriman
                </h4>
              </div>
              {address?.label && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#eadecb] text-[#5c7365]">
                  {address.label}
                </span>
              )}
            </div>

            {address ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-sm font-bold text-[#2d3d32]">
                    {address.recipientName}
                  </p>
                  <span className="text-xs text-[#8e8476]">
                    ({address.phone})
                  </span>
                </div>
                <p className="text-xs text-[#5c7365] leading-relaxed pt-0.5">
                  {address.fullAddress}
                </p>
                <p className="text-xs text-[#726759] font-medium">
                  {address.city}, {address.province} {address.postalCode}
                </p>
              </div>
            ) : (
              <p className="text-xs text-red-600 leading-relaxed">
                Alamat belum dipilih. Silakan kembali ke halaman checkout untuk
                memilih alamat pengiriman.
              </p>
            )}
          </div>
        </div>

        {/* Metode Pengiriman */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#f6e4da]/60 to-[#fffdf8] p-5 ring-1 ring-[#efd5c6]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#cc6644] text-white">
                  <Truck className="size-4" />
                </div>
                <h4 className="text-xs font-bold text-[#3d5446] uppercase tracking-wider">
                  Metode Pengiriman
                </h4>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#f0ebe1] text-[#726759] uppercase tracking-wider">
                {shipping?.courier ?? 'Kurir'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#2d3d32]">
                  {shipping?.courier ?? '-'} - {shipping?.service ?? '-'}
                </p>
                {shipping?.price !== undefined && (
                  <span className="text-xs font-bold text-[#3d5446]">
                    {formatIDR(shipping.price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#726759] mt-4 pt-3 border-t border-[#ede7dc]">
            <Clock className="size-3.5 text-[#a89f91] shrink-0" />
            <span>
              Estimasi tiba:{' '}
              <strong className="font-semibold text-[#3d5446]">
                {shipping?.description ?? '-'}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
