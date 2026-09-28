'use client';

import {
  ProfileEmptyState,
  profileOutlineButtonClassName,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type CustomerAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/use-address';
import { cn } from '@/lib/utils';
import {
  Building2,
  Check,
  Home,
  type LucideIcon,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  StickyNote,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface SavedAddressCardProps {
  address: CustomerAddress;
  onEdit: (address: CustomerAddress) => void;
}

function AddressField({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#b08a5e]" />
      <div className="min-w-0">
        <div className="text-[11px] font-medium tracking-wider text-[#9a8f80] uppercase">
          {label}
        </div>
        <div className="text-sm text-[#3d4f45]">{children}</div>
      </div>
    </div>
  );
}

function SavedAddressCard({ address, onEdit }: SavedAddressCardProps) {
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultAddress();
  const LabelIcon = /kantor|office/i.test(address.label) ? Building2 : Home;

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-2xl bg-white ring-1 transition-all duration-300 hover:shadow-[0_16px_32px_-22px_rgba(89,69,38,0.45)]',
        address.isDefault
          ? 'ring-2 ring-[#2f5f49]/40'
          : 'ring-[#efe8dd] hover:ring-[#caa86a]/50',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-5',
          address.isDefault
            ? 'border-[#d5e2d8] bg-gradient-to-r from-[#e3ece5] to-[#faf7f2]'
            : 'border-[#efe8dd] bg-[#faf7f2]',
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'grid size-9 place-items-center rounded-xl',
              address.isDefault
                ? 'bg-[#2f5f49] text-[#e8cb8d]'
                : 'bg-[#f5ead3] text-[#a07a2c]',
            )}
          >
            <LabelIcon className="size-4" />
          </span>
          <span className="font-semibold text-[#2f4f3f]">{address.label}</span>
          {address.isDefault && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 rounded-full border-none bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] px-2 py-0.5 text-[10px] font-semibold text-[#3c2e14] hover:bg-[#e8cb8d]"
            >
              <Star className="size-3 fill-current" />
              Utama
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSettingDefault}
              className={cn(profileOutlineButtonClassName, 'h-8 px-3 text-xs')}
              onClick={() => setDefault(address.id)}
            >
              <Check className="size-3.5" />
              {isSettingDefault ? 'Menyimpan...' : 'Jadikan Utama'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={cn(profileOutlineButtonClassName, 'h-8 px-3 text-xs')}
            onClick={() => onEdit(address)}
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              aria-label={`Hapus alamat ${address.label}`}
              className="h-8 cursor-pointer rounded-xl border-[#f0cfc7] bg-white px-3 text-xs text-[#b04a3a] hover:bg-[#f6e1dd] hover:text-[#9a3b2d]"
              onClick={() => deleteAddress(address.id)}
            >
              <Trash2 className="size-3.5" />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
        <AddressField icon={UserRound} label="Penerima">
          <span className="font-semibold">{address.recipientName}</span>
        </AddressField>
        <AddressField icon={Phone} label="Nomor Telepon">
          <span className="font-semibold">{address.phone}</span>
        </AddressField>
        <div className="md:col-span-2">
          <AddressField icon={MapPin} label="Alamat Lengkap">
            {address.fullAddress}
          </AddressField>
        </div>
        {address.notes && (
          <div className="md:col-span-2">
            <AddressField icon={StickyNote} label="Catatan">
              <span className="text-[#6f6a62] italic">{address.notes}</span>
            </AddressField>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedAddressCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#efe8dd]">
      <div className="flex items-center justify-between border-b border-[#efe8dd] bg-[#faf7f2] px-5 py-3">
        <Skeleton className="h-5 w-32 bg-[#e8e2d5]" />
        <Skeleton className="h-7 w-20 bg-[#e8e2d5]" />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 bg-[#e8e2d5]" />
          <Skeleton className="h-10 bg-[#e8e2d5]" />
        </div>
        <Skeleton className="h-12 bg-[#e8e2d5]" />
      </div>
    </div>
  );
}

interface SavedAddressListProps {
  addresses: CustomerAddress[];
  isLoading: boolean;
  onEdit: (address: CustomerAddress) => void;
  onAddNew?: () => void;
}

export function SavedAddressList({
  addresses,
  isLoading,
  onEdit,
  onAddNew,
}: SavedAddressListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <SavedAddressCardSkeleton />
        <SavedAddressCardSkeleton />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <ProfileEmptyState
        icon={MapPin}
        title="Belum ada alamat tersimpan"
        description="Simpan alamat pengiriman agar checkout lebih cepat."
        action={
          onAddNew ? (
            <Button
              className={cn(profilePrimaryButtonClassName, 'h-9 px-4')}
              onClick={onAddNew}
            >
              <Plus className="size-4" />
              Tambah Alamat
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) => (
        <SavedAddressCard key={address.id} address={address} onEdit={onEdit} />
      ))}
    </div>
  );
}
