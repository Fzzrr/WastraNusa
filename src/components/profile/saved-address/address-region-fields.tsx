'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type CreateAddressInput } from '@/schemas/address.schema';
import { kabupaten, kecamatan, provinsi } from 'daftar-wilayah-indonesia';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

const ALL_PROVINCES = provinsi();

/**
 * Province → city → district pickers. Each list comes from the selected parent,
 * and a saved name the library doesn't know is kept as a custom option.
 */
export function AddressRegionFields() {
  const {
    register,
    control,
    setValue,
    clearErrors,
    formState: { errors, touchedFields, submitCount },
  } = useFormContext<CreateAddressInput>();

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

  return (
    <>
      {/* Province + City */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
            Provinsi <span className="text-red-400">*</span>
          </label>
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
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
                  // Radix's hidden <select> reports '' when the current value
                  // has no option yet (lists load after the parent is set);
                  // a real pick is never empty, so ignore it.
                  if (!val) return;
                  field.onChange(val);
                  clearErrors('province');
                  setValue('city', '', { shouldValidate: true });
                  setValue('district', '', { shouldValidate: true });
                }}
              >
                <SelectTrigger
                  className={cn(
                    'h-11 w-full rounded-lg border border-border bg-card px-4 text-[15px] text-ink focus-visible:border-border focus-visible:ring-3 focus-visible:ring-border/30',
                    !field.value && 'text-ink-soft',
                  )}
                  aria-invalid={
                    !watchedProvince &&
                    (touchedFields.province || submitCount > 0) &&
                    !!errors.province
                  }
                >
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-xl border border-border bg-card text-ink">
                  <SelectGroup>
                    {ALL_PROVINCES.map((p) => (
                      <SelectItem
                        key={p.kode}
                        value={p.nama}
                        className="cursor-pointer rounded-lg text-[15px] text-ink hover:bg-surface focus:bg-surface focus:text-ink"
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
              <p className="mt-1 text-[13px] text-red-500">
                {errors.province.message}
              </p>
            )}
        </div>
        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
            Kota / Kabupaten <span className="text-red-400">*</span>
          </label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Select
                disabled={!watchedProvince || cityOptions.length === 0}
                value={field.value ?? ''}
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
                  if (!val) return; // see the note on the first select
                  field.onChange(val);
                  clearErrors(['city', 'district']);
                  setValue('district', '', { shouldValidate: true });
                }}
              >
                <SelectTrigger
                  className={cn(
                    'h-11 w-full rounded-lg border border-border bg-card px-4 text-[15px] text-ink focus-visible:border-border focus-visible:ring-3 focus-visible:ring-border/30 disabled:cursor-not-allowed disabled:opacity-60',
                    !field.value && 'text-ink-soft',
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
                <SelectContent className="max-h-60 rounded-xl border border-border bg-card text-ink">
                  <SelectGroup>
                    {cityOptions.map((c) => (
                      <SelectItem
                        key={c.kode}
                        value={c.nama}
                        className="cursor-pointer rounded-lg text-[15px] text-ink hover:bg-surface focus:bg-surface focus:text-ink"
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
              <p className="mt-1 text-[13px] text-red-500">
                {errors.city.message}
              </p>
            )}
        </div>
      </div>

      {/* District + Subdistrict + Postal Code */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
            Kecamatan <span className="text-red-400">*</span>
          </label>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Select
                disabled={!watchedCity || districtOptions.length === 0}
                value={field.value ?? ''}
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
                  if (!val) return; // see the note on the first select
                  field.onChange(val);
                  clearErrors('district');
                }}
              >
                <SelectTrigger
                  className={cn(
                    'h-11 w-full rounded-lg border border-border bg-card px-4 text-[15px] text-ink focus-visible:border-border focus-visible:ring-3 focus-visible:ring-border/30 disabled:cursor-not-allowed disabled:opacity-60',
                    !field.value && 'text-ink-soft',
                  )}
                  aria-invalid={
                    !watchedDistrict &&
                    (touchedFields.district || submitCount > 0) &&
                    !!errors.district
                  }
                >
                  <SelectValue
                    placeholder={
                      !watchedCity ? 'Pilih Kota/Kab dahulu' : 'Pilih Kecamatan'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-xl border border-border bg-card text-ink">
                  <SelectGroup>
                    {districtOptions.map((d) => (
                      <SelectItem
                        key={d.kode}
                        value={d.nama}
                        className="cursor-pointer rounded-lg text-[15px] text-ink hover:bg-surface focus:bg-surface focus:text-ink"
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
              <p className="mt-1 text-[13px] text-red-500">
                {errors.district.message}
              </p>
            )}
        </div>
        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
            Kelurahan
          </label>
          <Input
            {...register('subdistrict')}
            placeholder="Dago (opsional)"
            className="h-11 border-border bg-card px-4 text-ink placeholder:text-ink-soft focus-visible:border-border focus-visible:ring-border/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-ink-soft">
            Kode Pos <span className="text-red-400">*</span>
          </label>
          <Input
            {...register('postalCode')}
            placeholder="40132"
            className="h-11 border-border bg-card px-4 text-ink placeholder:text-ink-soft focus-visible:border-border focus-visible:ring-border/30"
          />
          {errors.postalCode && (
            <p className="mt-1 text-[13px] text-red-500">
              {errors.postalCode.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
