'use client';

import { formatIDR } from '@/lib/utils';
import type {
  CheckoutAddressSelection,
  CheckoutSelectedItem,
  CheckoutShippingSelection,
} from '@/types/checkout';
import { Clock, Hexagon, MapPin, Truck } from 'lucide-react';
import Image from 'next/image';

interface ReviewItemsProps {
  items: CheckoutSelectedItem[];
  shipping?: CheckoutShippingSelection;
  address?: CheckoutAddressSelection;
}

export function ReviewItems({ items, shipping, address }: ReviewItemsProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e2d5] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#3d5446]">Pesanan Anda</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4efe6] text-[#5c7365]">
          {items.length} Produk
        </span>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.cartItemId}
            className="bg-[#fbf9f5] border border-[#ece6dc] rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 transition-colors hover:border-[#dfd7ca]"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-[#e8e2d5] rounded-xl overflow-hidden flex flex-col items-center justify-center text-[#8e8476] bg-[#f4efe6]">
              {item.imageURL ? (
                <Image
                  src={item.imageURL}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
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
              <h3 className="font-bold text-[#2d3d32] text-sm sm:text-base leading-snug truncate sm:whitespace-normal">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {item.variant && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#efeae1] text-[#635747]">
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
              <span className="font-bold text-[#3d5446] text-sm sm:text-base">
                {formatIDR(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alamat Pengiriman */}
        <div className="bg-gradient-to-br from-[#fcfbf9] to-[#f8f5ef] border border-[#e6dfd3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#3d5446]/10 text-[#3d5446]">
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
        <div className="bg-gradient-to-br from-[#fcfbf9] to-[#f8f5ef] border border-[#e6dfd3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#cc6644]/10 text-[#cc6644]">
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
    </div>
  );
}
