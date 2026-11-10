'use client';

import {
  ChoicePills,
  CreatableCombobox,
  Field,
  FormSection,
  GENDER_CHOICES,
  inputClassName,
} from '@/components/form-sections';
import { Input } from '@/components/ui/input';
import { type ArticleFieldOptions } from '@/hooks/use-article';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { SlidersHorizontal } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

export function DetailsSection({
  fieldOptions,
  isLoadingFieldOptions,
}: {
  fieldOptions?: ArticleFieldOptions;
  isLoadingFieldOptions: boolean;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateArticleInput>();
  return (
    <FormSection
      icon={SlidersHorizontal}
      title="Detail Tambahan"
      description="Informasi pendukung untuk filter dan tampilan"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Estimasi Waktu Baca (Menit)"
          required
          error={errors.readMinutes?.message}
        >
          <Input
            {...register('readMinutes', { valueAsNumber: true })}
            type="number"
            min={1}
            placeholder="6"
            className={inputClassName}
          />
        </Field>
        <Field
          label="Gender"
          error={errors.gender?.message}
          className="md:col-span-2"
        >
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <ChoicePills
                ariaLabel="Gender"
                value={field.value ?? null}
                onChange={field.onChange}
                options={GENDER_CHOICES}
              />
            )}
          />
        </Field>
        <Field
          label="Suku / Kelompok Etnis"
          error={errors.ethnicGroup?.message}
        >
          <Controller
            control={control}
            name="ethnicGroup"
            render={({ field }) => (
              <CreatableCombobox
                value={field.value}
                onChange={field.onChange}
                options={fieldOptions?.ethnicGroups ?? []}
                isLoading={isLoadingFieldOptions}
                placeholder="Cari atau buat suku / etnis"
                emptyText="Belum ada suku tersimpan."
              />
            )}
          />
        </Field>
        <Field label="Jenis Pakaian" error={errors.clothingType?.message}>
          <Controller
            control={control}
            name="clothingType"
            render={({ field }) => (
              <CreatableCombobox
                value={field.value}
                onChange={field.onChange}
                options={fieldOptions?.clothingTypes ?? []}
                isLoading={isLoadingFieldOptions}
                placeholder="Cari atau buat jenis pakaian"
                emptyText="Belum ada jenis pakaian tersimpan."
              />
            )}
          />
        </Field>
      </div>

      <label className="group mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3 ring-1 ring-border transition-colors hover:bg-surface">
        <div>
          <p className="text-base font-medium text-ink">
            Tampilkan di Featured
          </p>
          <p className="text-[13px] text-ink-soft">
            Artikel akan ditonjolkan di halaman ensiklopedia
          </p>
        </div>
        <span className="relative shrink-0">
          <input
            {...register('featured')}
            type="checkbox"
            className="peer sr-only"
          />
          <span className="block h-6 w-11 rounded-full bg-surface transition-colors peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20" />
          <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-card transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
    </FormSection>
  );
}
