'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type CustomerAddress,
  useCreateAddress,
  useUpdateAddress,
} from '@/hooks/use-address';
import { useModalPresence } from '@/hooks/use-modal-presence';
import {
  type CreateAddressInput,
  createAddressSchema,
  updateAddressSchema,
} from '@/schemas/address.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, MapPin, X } from 'lucide-react';
import { useEffect } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AddressRegionFields } from './address-region-fields';

interface AddUpdateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomerAddress | null;
}

const EMPTY_DEFAULTS: CreateAddressInput = {
  label: '',
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  subdistrict: '',
  postalCode: '',
  fullAddress: '',
  notes: '',
  isDefault: false,
};

export default function AddUpdateAddressModal({
  isOpen,
  onClose,
  initialData,
}: AddUpdateAddressModalProps) {
  const isMounted = useModalPresence(isOpen);
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const isEdit = !!initialData;
  const isPending = isCreating || isUpdating;

  const form = useForm<CreateAddressInput>({
    resolver: zodResolver(
      isEdit ? updateAddressSchema : createAddressSchema,
    ) as Resolver<CreateAddressInput>,
    defaultValues: EMPTY_DEFAULTS,
    mode: 'onTouched',
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // Sync form values when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        label: initialData.label,
        recipientName: initialData.recipientName,
        phone: initialData.phone,
        province: initialData.province,
        city: initialData.city,
        district: initialData.district,
        subdistrict: initialData.subdistrict ?? '',
        postalCode: initialData.postalCode,
        fullAddress: initialData.fullAddress,
        notes: initialData.notes ?? '',
        isDefault: initialData.isDefault,
      });
    } else if (isOpen && !initialData) {
      reset(EMPTY_DEFAULTS);
    }
  }, [isOpen, initialData, reset]);

  if (!isMounted) return null;

  const onSubmit = (data: CreateAddressInput) => {
    if (isEdit && initialData) {
      updateAddress(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            toast.success('Alamat berhasil diperbarui');
            onClose();
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Gagal memperbarui alamat',
            );
          },
        },
      );
    } else {
      createAddress(data, {
        onSuccess: () => {
          toast.success('Alamat berhasil ditambahkan');
          reset(EMPTY_DEFAULTS);
          onClose();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Gagal menambahkan alamat',
          );
        },
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-2xl transition-all duration-300 ${
            isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3 text-ink">
              <MapPin className="h-5 w-5 text-ink-soft" />
              <h2 className="text-xl font-semibold text-ink">
                {isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="rounded-full bg-surface text-ink-soft transition-colors hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
              {/* Label */}
              <div>
                <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
                  Label Alamat <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register('label')}
                  placeholder="Contoh: Rumah, Kantor, Kos"
                  className="h-11 border-border bg-card px-4 text-ink placeholder:text-ink-soft focus-visible:border-border focus-visible:ring-border/30"
                />
                {errors.label && (
                  <p className="mt-1 text-[13px] text-red-500">
                    {errors.label.message}
                  </p>
                )}
              </div>

              {/* Recipient + Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
                    Nama Penerima <span className="text-red-400">*</span>
                  </label>
                  <Input
                    {...register('recipientName')}
                    placeholder="Nama lengkap penerima"
                    className="h-11 border-border bg-card px-4 text-ink placeholder:text-ink-soft focus-visible:border-border focus-visible:ring-border/30"
                  />
                  {errors.recipientName && (
                    <p className="mt-1 text-[13px] text-red-500">
                      {errors.recipientName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
                    Nomor Telepon <span className="text-red-400">*</span>
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="08xxxxxxxxxx"
                    className="h-11 border-border bg-card px-4 text-ink placeholder:text-ink-soft focus-visible:border-border focus-visible:ring-border/30"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[13px] text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <AddressRegionFields />

              {/* Full Address */}
              <div>
                <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
                  Alamat Lengkap <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...register('fullAddress')}
                  rows={3}
                  placeholder="Jl. Contoh No. 123, RT 01/RW 02..."
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft outline-none transition-all focus:border-border focus:ring-2 focus:ring-border/20"
                />
                {errors.fullAddress && (
                  <p className="mt-1 text-[13px] text-red-500">
                    {errors.fullAddress.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
                  Catatan{' '}
                  <span className="text-[13px] font-normal text-ink-soft">
                    (opsional)
                  </span>
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Patokan / petunjuk tambahan untuk kurir..."
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft outline-none transition-all focus:border-border focus:ring-2 focus:ring-border/20"
                />
              </div>

              {/* Set as default */}
              {isEdit && initialData?.isDefault ? (
                /* Already the default — show a locked indicator; user cannot un-default here */
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <Check className="h-4 w-4 flex-shrink-0 text-ink" />
                  <div>
                    <span className="text-[15px] font-medium text-ink">
                      Ini adalah alamat utama Anda
                    </span>
                    <p className="mt-0.5 text-[13px] text-ink-soft">
                      Untuk mengganti alamat utama, atur alamat lain sebagai
                      utama.
                    </p>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface">
                  <input
                    {...register('isDefault')}
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-brand"
                  />
                  <span className="text-[15px] text-ink">
                    Jadikan sebagai alamat utama
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 rounded-b-2xl border-t border-border bg-card px-6 py-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-base font-medium text-on-field transition-colors hover:bg-brand-strong"
            >
              {isPending ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {isPending
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Tambah Alamat'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-full border-border bg-card px-6 text-base font-medium text-ink-soft transition-colors hover:bg-surface"
            >
              Batal
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
