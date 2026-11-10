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
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-soft" />
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink-soft">{label}</div>
        <div className="text-[15px] text-ink">{children}</div>
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
        'group overflow-hidden rounded-xl bg-card transition-shadow duration-300',
        address.isDefault ? 'ring-2 ring-brand/40' : 'ring-0',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 px-4 pt-4 md:px-5',
          address.isDefault
            ? 'border-border bg-surface'
            : 'border-border bg-surface',
        )}
      >
        <div className="flex items-center gap-3">
          <LabelIcon
            className={cn(
              'size-5 shrink-0',
              address.isDefault ? 'text-brand' : 'text-ink-soft',
            )}
            strokeWidth={1.75}
          />
          <span className="font-semibold text-ink">{address.label}</span>
          {address.isDefault && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 rounded-full border-none bg-brand/10 px-2.5 py-0.5 text-[13px] font-semibold text-brand hover:bg-brand/10"
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
              className={cn(
                profileOutlineButtonClassName,
                'h-8 px-3 text-[13px]',
              )}
              onClick={() => setDefault(address.id)}
            >
              <Check className="size-3.5" />
              {isSettingDefault ? 'Menyimpan...' : 'Jadikan Utama'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              profileOutlineButtonClassName,
              'h-8 px-3 text-[13px]',
            )}
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
              className="h-8 cursor-pointer rounded-full border-destructive/30 bg-card px-3 text-[13px] text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              <span className="text-ink-soft italic">{address.notes}</span>
            </AddressField>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedAddressCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card">
      <div className="flex items-center justify-between bg-surface px-5 py-3">
        <Skeleton className="h-5 w-32 bg-surface" />
        <Skeleton className="h-7 w-20 bg-surface" />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 bg-surface" />
          <Skeleton className="h-10 bg-surface" />
        </div>
        <Skeleton className="h-12 bg-surface" />
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
