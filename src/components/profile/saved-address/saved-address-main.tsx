'use client';

import {
  ProfileSection,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { type CustomerAddress, useAddresses } from '@/hooks/use-address';
import { cn } from '@/lib/utils';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

import AddUpdateAddressModal from './add-update-address-modal';
import { SavedAddressList } from './saved-address-list';

export function SavedAddressMain() {
  const { data: addresses = [], isLoading } = useAddresses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <>
      <ProfileSection
        icon={MapPin}
        title={
          <span className="flex items-center gap-2">
            Alamat Tersimpan
            {!isLoading && addresses.length > 0 ? (
              <span className="rounded-full bg-[#e3ece5] px-2 py-0.5 text-xs font-semibold text-[#2f5f49]">
                {addresses.length}
              </span>
            ) : null}
          </span>
        }
        description="Alamat utama dipakai otomatis saat checkout"
        aside={
          <Button
            className={cn(profilePrimaryButtonClassName, 'h-9 px-4')}
            onClick={handleAddNew}
          >
            <Plus className="size-4" />
            Tambah Alamat
          </Button>
        }
      >
        <SavedAddressList
          addresses={addresses}
          isLoading={isLoading}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
        />
      </ProfileSection>

      <AddUpdateAddressModal
        key={editingAddress?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={handleClose}
        initialData={editingAddress}
      />
    </>
  );
}
