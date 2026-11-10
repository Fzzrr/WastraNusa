'use client';

import {
  Field,
  FormSection,
  ImagePreview,
  inputClassName,
  textareaClassName,
} from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

export function ArticleSectionsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateArticleInput>();
  const sections = useWatch({ control, name: 'sections' });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });
  return (
    <FormSection
      icon={Layers}
      title="Bagian Artikel"
      description={`${fields.length} bagian · isi utama artikel`}
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ title: '', content: '', order: fields.length })
          }
          className="cursor-pointer gap-1.5 rounded-lg border-brand/30 text-ink hover:bg-surface hover:text-ink"
        >
          <Plus className="size-4" />
          Tambah Bagian
        </Button>
      }
    >
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface py-8 text-[15px] text-ink-soft">
            <Layers className="size-5 text-ink-soft" />
            Belum ada bagian.
          </div>
        ) : null}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="animate-in space-y-4 rounded-xl border-l-4 border-gold bg-surface p-4 ring-1 ring-border fade-in slide-in-from-bottom-1"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-[13px] text-on-field">
                  {index + 1}
                </span>
                {sections?.[index]?.title?.trim() || `Bagian ${index + 1}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Hapus bagian ${index + 1}`}
                onClick={() => remove(index)}
                className="cursor-pointer rounded-lg text-ink-soft hover:bg-red-50 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <Field
              label="Judul Bagian"
              required
              error={errors.sections?.[index]?.title?.message}
            >
              <Input
                {...register(`sections.${index}.title` as const)}
                placeholder="Contoh: Sejarah Singkat"
                className={inputClassName}
              />
            </Field>
            <Field
              label="Isi Konten"
              required
              error={errors.sections?.[index]?.content?.message}
            >
              <textarea
                {...register(`sections.${index}.content` as const)}
                rows={4}
                placeholder="Tuliskan isi bagian ini..."
                className={textareaClassName}
              />
            </Field>
            <Field
              label="URL Gambar Bagian"
              error={errors.sections?.[index]?.imageURL?.message}
            >
              <div className="flex items-start gap-3">
                <Input
                  {...register(`sections.${index}.imageURL` as const)}
                  placeholder="https://example.com/section-image.jpg"
                  className={cn(inputClassName, 'flex-1')}
                />
                <ImagePreview
                  url={sections?.[index]?.imageURL}
                  className="h-11 w-20"
                />
              </div>
            </Field>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
