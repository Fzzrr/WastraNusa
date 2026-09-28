'use client';

import {
  ProfileSection,
  profileOutlineButtonClassName,
} from '@/components/profile/profile-section';
import AddUpdateAddressModal from '@/components/profile/saved-address/add-update-address-modal';
import { Button } from '@/components/ui/button';
import { type CustomerAddress, useAddresses } from '@/hooks/use-address';
import { cn } from '@/lib/utils';
import type { CheckoutAddressSelection } from '@/types/checkout';
import {
  AlertCircle,
  Check,
  Edit2,
  MapPin,
  Plus,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface AddressSectionProps {
  initialSelectedAddressId?: string;
  onSelectAddress?: (address: CheckoutAddressSelection | null) => void;
}

function toCheckoutAddressSelection(
  address: CustomerAddress,
): CheckoutAddressSelection {
  return {
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    fullAddress: address.fullAddress,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
  };
}

export function AddressSection({
  initialSelectedAddressId,
  onSelectAddress,
}: AddressSectionProps) {
  const { data: addresses = [], isLoading, error } = useAddresses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => initialSelectedAddressId ?? null,
  );

  const activeAddressId = useMemo(() => {
    if (selectedAddressId) return selectedAddressId;

    const defaultAddress = addresses.find((address) => address.isDefault);
    if (defaultAddress) return defaultAddress.id;

    return addresses[0]?.id ?? null;
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(() => {
    const activeAddress = addresses.find(
      (address) => address.id === activeAddressId,
    );
    return activeAddress ? toCheckoutAddressSelection(activeAddress) : null;
  }, [activeAddressId, addresses]);

  useEffect(() => {
    onSelectAddress?.(selectedAddress);
  }, [selectedAddress, onSelectAddress]);

  const errorMessage =
    error instanceof Error ? error.message : 'Gagal memuat alamat';

  const shouldShowAddAddressWarning =
    !isLoading &&
    (addresses.length === 0 ||
      (error instanceof Error &&
        /address|alamat|not found|belum/i.test(error.message)));

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find((addr) => addr.id === addressId);
    onSelectAddress?.(
      selectedAddress ? toCheckoutAddressSelection(selectedAddress) : null,
    );
  };

  return (
    <>
      <ProfileSection
        icon={MapPin}
        title="Alamat Pengiriman"
        description="Pesanan akan dikirim ke alamat yang dipilih"
        aside={
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className={cn(profileOutlineButtonClassName, 'h-8 px-3 text-xs')}
            >
              <Link href="/profile/saved-address">
                <Settings2 className="size-3.5" />
                Kelola Alamat
              </Link>
            </Button>
            <Button
              onClick={handleAddNew}
              variant="outline"
              className={cn(profileOutlineButtonClassName, 'h-8 px-3 text-xs')}
            >
              <Plus className="size-3.5" /> Tambah Alamat Baru
            </Button>
          </div>
        }
      >
        {shouldShowAddAddressWarning && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#f0cfc7] bg-[#fbf1eb] px-4 py-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#b04a3a]" />
            <p className="text-xs font-semibold text-[#9a3b2d]">
              Belum ada alamat tersimpan. Silakan tambah alamat baru untuk
              melanjutkan checkout.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-28 animate-pulse rounded-xl bg-[#f4efe5]" />
            <div className="h-28 animate-pulse rounded-xl bg-[#f4efe5]" />
          </div>
        ) : error && addresses.length === 0 ? (
          <div className="rounded-xl border border-[#f0cfc7] bg-[#fbf1eb] px-4 py-3">
            <p className="text-xs text-[#9a3b2d]">{errorMessage}</p>
          </div>
        ) : (
          <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
            {addresses.map((addr) => {
              const isActive = activeAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={0}
                  onClick={() => handleSelectAddress(addr.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelectAddress(addr.id);
                    }
                  }}
                  className={cn(
                    'relative cursor-pointer rounded-xl p-4 ring-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#2f5f49]',
                    isActive
                      ? 'bg-gradient-to-br from-[#e3ece5] to-[#fffdf8] shadow-[0_10px_24px_-16px_rgba(47,95,73,0.7)] ring-2 ring-[#2f5f49]/50'
                      : 'bg-white ring-[#efe8dd] hover:-translate-y-0.5 hover:ring-[#caa86a]/50',
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          'rounded-lg px-2 py-0.5 text-[10px] font-bold',
                          isActive
                            ? 'bg-[#2f5f49] text-[#e8cb8d]'
                            : 'bg-[#f4efe5] text-[#8a6a3a]',
                        )}
                      >
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] px-2 py-0.5 text-[10px] font-bold text-[#3c2e14]">
                          Utama
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-full transition-all',
                        isActive
                          ? 'bg-[#2f5f49] text-white'
                          : 'ring-2 ring-[#e3d9c7]',
                      )}
                    >
                      {isActive ? <Check className="size-3" /> : null}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#2f4f3f]">
                    {addr.recipientName}
                    <span className="ml-1.5 text-xs font-normal text-[#9a8f80]">
                      {addr.phone}
                    </span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6f6a62]">
                    {addr.fullAddress}
                  </p>
                  <button
                    type="button"
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#2f5f49] hover:underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEdit(addr);
                    }}
                  >
                    <Edit2 className="size-3" /> Ubah
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ProfileSection>

      <AddUpdateAddressModal
        key={editingAddress?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingAddress}
      />
    </>
  );
}
