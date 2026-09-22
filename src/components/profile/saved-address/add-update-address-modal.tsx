'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type CustomerAddress,
  useCreateAddress,
  useUpdateAddress,
} from '@/hooks/use-address';
import { cn } from '@/lib/utils';
import {
  type CreateAddressInput,
  createAddressSchema,
  updateAddressSchema,
} from '@/schemas/address.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { kabupaten, kecamatan, provinsi } from 'daftar-wilayah-indonesia';
import { Check, MapPin, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface AddUpdateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomerAddress | null;
}

const ALL_PROVINCES = provinsi();

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
  const [showModal, setShowModal] = useState(isOpen);
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const isEdit = !!initialData;
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    clearErrors,
    formState: { errors, touchedFields, submitCount },
  } = useForm<CreateAddressInput>({
    resolver: zodResolver(
      isEdit ? updateAddressSchema : createAddressSchema,
    ) as Resolver<CreateAddressInput>,
    defaultValues: EMPTY_DEFAULTS,
    mode: 'onTouched',
  });

  const watchedProvince = useWatch({ control, name: 'province' });
  const watchedCity = useWatch({ control, name: 'city' });
  const watchedDistrict = useWatch({ control, name: 'district' });

  // Resolve selected province object from library
  const selectedProvince = useMemo(() => {
    if (!watchedProvince) return null;
    return (
      ALL_PROVINCES.find(
        (p) => p.nama.toLowerCase() === watchedProvince.toLowerCase(),
      ) ?? null
    );
  }, [watchedProvince]);

  // Cities / Kabupaten list for the selected province
  const cityOptions = useMemo(() => {
    if (!selectedProvince) return [];
    const list = kabupaten(selectedProvince.kode);
    // Retain custom or legacy city name if not found in list
    if (
      watchedCity &&
      !list.some((c) => c.nama.toLowerCase() === watchedCity.toLowerCase())
    ) {
      return [{ kode: 'custom-city', nama: watchedCity }, ...list];
    }
    return list;
  }, [selectedProvince, watchedCity]);

  // Resolve selected city object from library
  const selectedCity = useMemo(() => {
    if (!watchedCity || !cityOptions.length) return null;
    return (
      cityOptions.find(
        (c) => c.nama.toLowerCase() === watchedCity.toLowerCase(),
      ) ?? null
    );
  }, [watchedCity, cityOptions]);

  // Districts / Kecamatan list for the selected city
  const districtOptions = useMemo(() => {
    if (!selectedCity || selectedCity.kode === 'custom-city') return [];
    const list = kecamatan(selectedCity.kode);
    // Retain custom or legacy district name if not found in list
    if (
      watchedDistrict &&
      !list.some((d) => d.nama.toLowerCase() === watchedDistrict.toLowerCase())
    ) {
      return [{ kode: 'custom-district', nama: watchedDistrict }, ...list];
    }
    return list;
  }, [selectedCity, watchedDistrict]);

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

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (isOpen && !showModal) setShowModal(true);
  if (!isOpen && !showModal) return null;

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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-[#fdfaf5] shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ece7dd] px-6 py-4">
          <div className="flex items-center gap-3 text-[#4d6356]">
            <MapPin className="h-5 w-5 text-[#5c7365]" />
            <h2 className="text-lg font-semibold">
              {isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-full bg-[#f3ede8] text-[#8f9b94] transition-colors hover:bg-[#e6dcd5]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Label */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                Label Alamat <span className="text-red-400">*</span>
              </label>
              <Input
                {...register('label')}
                placeholder="Contoh: Rumah, Kantor, Kos"
                className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
              />
              {errors.label && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.label.message}
                </p>
              )}
            </div>

            {/* Recipient + Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  Nama Penerima <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register('recipientName')}
                  placeholder="Nama lengkap penerima"
                  className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
                />
                {errors.recipientName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.recipientName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  No. Telepon <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register('phone')}
                  placeholder="08xxxxxxxxxx"
                  className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Province + City */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  Provinsi <span className="text-red-400">*</span>
                </label>
                <Controller
                  control={control}
                  name="province"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onOpenChange={(open) => {
                        if (!open && !field.value) {
                          field.onBlur();
                          setValue('province', '', {
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      onValueChange={(val) => {
                        field.onChange(val);
                        clearErrors('province');
                        setValue('city', '', { shouldValidate: true });
                        setValue('district', '', { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-11 w-full rounded-lg border border-[#e5ded5] bg-[#fdfaf7] px-4 text-sm text-[#4d6356] focus-visible:border-[#5c7365] focus-visible:ring-3 focus-visible:ring-[#5c7365]/30',
                          !field.value && 'text-[#b0b8b3]',
                        )}
                        aria-invalid={
                          !watchedProvince &&
                          (touchedFields.province || submitCount > 0) &&
                          !!errors.province
                        }
                      >
                        <SelectValue placeholder="Pilih Provinsi" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl border border-[#e5ded5] bg-[#fdfaf7] text-[#4d6356] shadow-lg">
                        <SelectGroup>
                          {ALL_PROVINCES.map((p) => (
                            <SelectItem
                              key={p.kode}
                              value={p.nama}
                              className="cursor-pointer rounded-lg text-sm text-[#4d6356] hover:bg-[#f3ede8] focus:bg-[#f3ede8] focus:text-[#3c5043]"
                            >
                              {p.nama}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {!watchedProvince &&
                  (touchedFields.province || submitCount > 0) &&
                  errors.province && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.province.message}
                    </p>
                  )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  Kota / Kabupaten <span className="text-red-400">*</span>
                </label>
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Select
                      disabled={!watchedProvince || cityOptions.length === 0}
                      value={field.value || undefined}
                      onOpenChange={(open) => {
                        if (!open && !field.value) {
                          field.onBlur();
                          setValue('city', '', {
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      onValueChange={(val) => {
                        field.onChange(val);
                        clearErrors(['city', 'district']);
                        setValue('district', '', { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-11 w-full rounded-lg border border-[#e5ded5] bg-[#fdfaf7] px-4 text-sm text-[#4d6356] focus-visible:border-[#5c7365] focus-visible:ring-3 focus-visible:ring-[#5c7365]/30 disabled:cursor-not-allowed disabled:opacity-60',
                          !field.value && 'text-[#b0b8b3]',
                        )}
                        aria-invalid={
                          !watchedCity &&
                          (touchedFields.city || submitCount > 0) &&
                          !!errors.city
                        }
                      >
                        <SelectValue
                          placeholder={
                            !watchedProvince
                              ? 'Pilih Provinsi terlebih dahulu'
                              : 'Pilih Kota / Kabupaten'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl border border-[#e5ded5] bg-[#fdfaf7] text-[#4d6356] shadow-lg">
                        <SelectGroup>
                          {cityOptions.map((c) => (
                            <SelectItem
                              key={c.kode}
                              value={c.nama}
                              className="cursor-pointer rounded-lg text-sm text-[#4d6356] hover:bg-[#f3ede8] focus:bg-[#f3ede8] focus:text-[#3c5043]"
                            >
                              {c.nama}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {!watchedCity &&
                  (touchedFields.city || submitCount > 0) &&
                  errors.city && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
              </div>
            </div>

            {/* District + Subdistrict + Postal Code */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  Kecamatan <span className="text-red-400">*</span>
                </label>
                <Controller
                  control={control}
                  name="district"
                  render={({ field }) => (
                    <Select
                      disabled={!watchedCity || districtOptions.length === 0}
                      value={field.value || undefined}
                      onOpenChange={(open) => {
                        if (!open && !field.value) {
                          field.onBlur();
                          setValue('district', '', {
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      onValueChange={(val) => {
                        field.onChange(val);
                        clearErrors('district');
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-11 w-full rounded-lg border border-[#e5ded5] bg-[#fdfaf7] px-4 text-sm text-[#4d6356] focus-visible:border-[#5c7365] focus-visible:ring-3 focus-visible:ring-[#5c7365]/30 disabled:cursor-not-allowed disabled:opacity-60',
                          !field.value && 'text-[#b0b8b3]',
                        )}
                        aria-invalid={
                          !watchedDistrict &&
                          (touchedFields.district || submitCount > 0) &&
                          !!errors.district
                        }
                      >
                        <SelectValue
                          placeholder={
                            !watchedCity
                              ? 'Pilih Kota/Kab dahulu'
                              : 'Pilih Kecamatan'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl border border-[#e5ded5] bg-[#fdfaf7] text-[#4d6356] shadow-lg">
                        <SelectGroup>
                          {districtOptions.map((d) => (
                            <SelectItem
                              key={d.kode}
                              value={d.nama}
                              className="cursor-pointer rounded-lg text-sm text-[#4d6356] hover:bg-[#f3ede8] focus:bg-[#f3ede8] focus:text-[#3c5043]"
                            >
                              {d.nama}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {!watchedDistrict &&
                  (touchedFields.district || submitCount > 0) &&
                  errors.district && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.district.message}
                    </p>
                  )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  Kelurahan
                </label>
                <Input
                  {...register('subdistrict')}
                  placeholder="Dago (opsional)"
                  className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                  Kode Pos <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register('postalCode')}
                  placeholder="40132"
                  className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                Alamat Lengkap <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register('fullAddress')}
                rows={3}
                placeholder="Jl. Contoh No. 123, RT 01/RW 02..."
                className="w-full resize-none rounded-xl border border-[#e5ded5] bg-[#fdfaf7] px-4 py-3 text-sm text-[#4d6356] placeholder:text-[#b0b8b3] outline-none transition-all focus:border-[#5c7365] focus:ring-2 focus:ring-[#5c7365]/20"
              />
              {errors.fullAddress && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.fullAddress.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
                Catatan{' '}
                <span className="text-xs font-normal text-[#8f9b94]">
                  (opsional)
                </span>
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Patokan / petunjuk tambahan untuk kurir..."
                className="w-full resize-none rounded-xl border border-[#e5ded5] bg-[#fdfaf7] px-4 py-3 text-sm text-[#4d6356] placeholder:text-[#b0b8b3] outline-none transition-all focus:border-[#5c7365] focus:ring-2 focus:ring-[#5c7365]/20"
              />
            </div>

            {/* Set as default */}
            {isEdit && initialData?.isDefault ? (
              /* Already the default — show a locked indicator; user cannot un-default here */
              <div className="flex items-center gap-3 rounded-xl border border-[#d4e6d9] bg-[#eef6f1] px-4 py-3">
                <Check className="h-4 w-4 flex-shrink-0 text-[#3c5043]" />
                <div>
                  <span className="text-sm font-medium text-[#3c5043]">
                    Ini adalah alamat utama Anda
                  </span>
                  <p className="mt-0.5 text-xs text-[#5c7365]">
                    Untuk mengganti alamat utama, atur alamat lain sebagai
                    utama.
                  </p>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#ece7dd] bg-[#f8f5ef] px-4 py-3 transition-colors hover:bg-[#f3ede6]">
                <input
                  {...register('isDefault')}
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-[#5c7365]"
                />
                <span className="text-sm text-[#4d6356]">
                  Jadikan sebagai alamat utama
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 rounded-b-2xl border-t border-[#ece7dd] bg-[#fdfaf5] px-6 py-4">
          <Button
            type="submit"
            disabled={isPending}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3c5043] text-base font-medium text-white transition-colors hover:bg-[#2d3d32]"
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
            className="h-11 rounded-xl border-[#d8cfbf] bg-white px-6 text-base font-medium text-[#5c7365] transition-colors hover:bg-[#f8f5ef]"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
