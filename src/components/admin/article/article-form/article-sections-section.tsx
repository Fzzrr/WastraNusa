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
      step={5}
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
          className="cursor-pointer gap-1.5 rounded-lg border-[#3a5a4a]/30 text-[#2f5543] hover:bg-[#e7efe4] hover:text-[#2f5543]"
        >
          <Plus className="size-4" />
          Tambah Bagian
        </Button>
      }
    >
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#e0d6c6] bg-[#faf7f2] py-8 text-sm text-[#9a8f80]">
            <Layers className="size-5 text-[#b08a5e]" />
            Belum ada bagian.
          </div>
        ) : null}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="animate-in space-y-4 rounded-xl border-l-4 border-[#d2a36d] bg-[#faf7f2] p-4 ring-1 ring-[#efe8dd] fade-in slide-in-from-bottom-1"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f4f3f]">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#3a5a4a] text-xs text-white">
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
                className="cursor-pointer rounded-lg text-[#a39c92] hover:bg-red-50 hover:text-red-600"
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
