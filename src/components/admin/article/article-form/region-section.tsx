'use client';

import {
  Field,
  FormSection,
  selectContentClassName,
  selectItemClassName,
  selectTriggerClassName,
} from '@/components/form-sections';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { kabupaten } from 'daftar-wilayah-indonesia';
import { Map as MapIcon, MapPin, MapPinned } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  ALL_PROVINCES,
  ISLAND_TO_PROVINCE_CODES,
  MAJOR_ISLANDS,
} from './constants';

export function RegionSection() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateArticleInput>();
  const watchedIsland = useWatch({ control, name: 'island' });
  const watchedProvince = useWatch({ control, name: 'province' });

  const filteredProvinces = useMemo(() => {
    if (!watchedIsland) return ALL_PROVINCES;
    const codes = ISLAND_TO_PROVINCE_CODES[watchedIsland] ?? [];
    return ALL_PROVINCES.filter((p) => codes.includes(p.kode));
  }, [watchedIsland]);

  const filteredKabupaten = useMemo(() => {
    const found = ALL_PROVINCES.find((p) => p.nama === watchedProvince);
    return found ? kabupaten(found.kode) : [];
  }, [watchedProvince]);
  return (
    <FormSection
      icon={MapPin}
      title="Asal Daerah"
      description="Tentukan daerah asal wastra"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Pulau" required error={errors.island?.message}>
          <Controller
            control={control}
            name="island"
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  // Radix's hidden <select> reports '' when the current value
                  // has no option yet (lists load after the parent is set);
                  // a real pick is never empty, so ignore it.
                  if (!val) return;
                  field.onChange(val);
                  setValue('province', '');
                  setValue('region', '');
                }}
                value={field.value ?? ''}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <MapIcon className="size-4 text-ink-soft" />
                  <SelectValue placeholder="Pilih Pulau" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className={selectContentClassName}
                >
                  {MAJOR_ISLANDS.map((island) => (
                    <SelectItem
                      key={island}
                      value={island}
                      className={selectItemClassName}
                    >
                      {island}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Provinsi" required error={errors.province?.message}>
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  if (!val) return; // see the note on the first select
                  field.onChange(val);
                  setValue('region', '');
                }}
                value={field.value ?? ''}
                disabled={!watchedIsland}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <MapPinned className="size-4 text-ink-soft" />
                  <SelectValue
                    placeholder={
                      watchedIsland ? 'Pilih Provinsi' : 'Pilih Provinsi'
                    }
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className={selectContentClassName}
                >
                  {filteredProvinces.map((p) => (
                    <SelectItem
                      key={p.kode}
                      value={p.nama}
                      className={selectItemClassName}
                    >
                      {p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Daerah" required error={errors.region?.message}>
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
              <Select
                onValueChange={(val) => val && field.onChange(val)}
                value={field.value ?? ''}
                disabled={!watchedProvince}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <MapPin className="size-4 text-ink-soft" />
                  <SelectValue
                    placeholder={watchedProvince ? 'Pilih Daerah' : 'Daerah'}
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className={selectContentClassName}
                >
                  {filteredKabupaten.map((k) => (
                    <SelectItem
                      key={k.kode}
                      value={k.nama}
                      className={selectItemClassName}
                    >
                      {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </FormSection>
  );
}
