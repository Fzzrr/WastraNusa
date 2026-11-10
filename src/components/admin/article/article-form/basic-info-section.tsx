'use client';

import {
  CreatableCombobox,
  Field,
  FormSection,
  inputClassName,
} from '@/components/form-sections';
import { Input } from '@/components/ui/input';
import { type ArticleFieldOptions } from '@/hooks/use-article';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { FileText } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

export function BasicInfoSection({
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
      icon={FileText}
      title="Informasi Dasar"
      description="Judul dan identitas utama artikel"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Judul Artikel"
          required
          error={errors.title?.message}
          className="md:col-span-2"
        >
          <Input
            {...register('title')}
            type="text"
            placeholder="Contoh: Sejarah Batik Jawa: Warisan Dunia UNESCO"
            className={inputClassName}
          />
        </Field>
        <Field label="Label Motif" required error={errors.motifLabel?.message}>
          <Controller
            control={control}
            name="motifLabel"
            render={({ field }) => (
              <CreatableCombobox
                value={field.value}
                onChange={field.onChange}
                options={fieldOptions?.motifLabels ?? []}
                isLoading={isLoadingFieldOptions}
                placeholder="Cari atau buat label motif"
                emptyText="Belum ada label motif tersimpan."
              />
            )}
          />
        </Field>
        <Field label="Topik" required error={errors.topic?.message}>
          <Controller
            control={control}
            name="topic"
            render={({ field }) => (
              <CreatableCombobox
                value={field.value}
                onChange={field.onChange}
                options={fieldOptions?.topics ?? []}
                isLoading={isLoadingFieldOptions}
                placeholder="Cari atau buat topik"
                emptyText="Belum ada topik tersimpan."
              />
            )}
          />
        </Field>
      </div>
    </FormSection>
  );
}
