'use client';

import {
  Field,
  FormSection,
  ImagePreview,
  inputClassName,
  textareaClassName,
} from '@/components/form-sections';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { BookOpen } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { EXCERPT_SOFT_LIMIT } from './constants';

export function SummarySection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateArticleInput>();
  const excerptLength = useWatch({ control, name: 'excerpt' })?.length ?? 0;
  const imageURL = useWatch({ control, name: 'imageURL' });
  return (
    <FormSection
      icon={BookOpen}
      title="Ringkasan & Gambar"
      description="Teks yang muncul di kartu dan halaman artikel"
    >
      <div className="space-y-4">
        <Field
          label="Excerpt (Ringkasan Pendek)"
          required
          error={errors.excerpt?.message}
          hint="Teaser singkat yang muncul di kartu artikel."
          aside={
            <span
              className={cn(
                'text-[13px] tabular-nums',
                excerptLength > EXCERPT_SOFT_LIMIT
                  ? 'text-destructive'
                  : 'text-ink-soft',
              )}
            >
              {excerptLength}/{EXCERPT_SOFT_LIMIT}
            </span>
          }
        >
          <textarea
            {...register('excerpt')}
            rows={2}
            placeholder="Teaser singkat yang muncul di kartu artikel..."
            className={textareaClassName}
          />
        </Field>
        <Field label="Ringkasan (Summary)" error={errors.summary?.message}>
          <textarea
            {...register('summary')}
            rows={3}
            placeholder="Ringkasan lengkap tentang isi artikel..."
            className={textareaClassName}
          />
        </Field>
        <Field label="Deskripsi Tambahan" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Detail informasi tambahan lainnya..."
            className={textareaClassName}
          />
        </Field>
        <Field
          label="URL Gambar Utama"
          error={errors.imageURL?.message}
          hint="Pratinjau muncul otomatis setelah URL diisi."
        >
          <div className="flex items-start gap-3">
            <Input
              {...register('imageURL')}
              type="text"
              placeholder="https://example.com/image.jpg"
              className={cn(inputClassName, 'flex-1')}
            />
            <ImagePreview url={imageURL} className="h-20 w-28" />
          </div>
        </Field>
      </div>
    </FormSection>
  );
}
