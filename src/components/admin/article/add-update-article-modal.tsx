'use client';

import { Button } from '@/components/ui/button';
import { ArticleStatus } from '@/generated/prisma/enums';
import {
  useArticleFieldOptions,
  useCreateArticle,
  useUpdateArticle,
} from '@/hooks/use-article';
import { useModalPresence } from '@/hooks/use-modal-presence';
import { cn } from '@/lib/utils';
import {
  type CreateArticleInput,
  createArticleSchema,
  updateArticleSchema,
} from '@/schemas/article.schema';
import { type EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Loader2, Save, X } from 'lucide-react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ArticleSectionsSection } from './article-form/article-sections-section';
import { BasicInfoSection } from './article-form/basic-info-section';
import { DetailsSection } from './article-form/details-section';
import { FormProgress } from './article-form/form-progress';
import { RegionSection } from './article-form/region-section';
import { SummarySection } from './article-form/summary-section';
import { WikipediaImportPanel } from './article-form/wikipedia-import-panel';

interface AddUpdateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EncyclopediaArticleDetail | null;
}

export default function AddUpdateArticleModal({
  isOpen,
  onClose,
  initialData,
}: AddUpdateArticleModalProps) {
  const isMounted = useModalPresence(isOpen);
  const { mutate: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle();

  const isEdit = !!initialData;
  const isPending = isCreating || isUpdating;

  const { data: fieldOptions, isLoading: isLoadingFieldOptions } =
    useArticleFieldOptions(isOpen);

  const defaultValues: CreateArticleInput = {
    title: initialData?.title ?? '',
    excerpt: initialData?.excerpt ?? '',
    topic: initialData?.topic ?? '',
    region: initialData?.region ?? '',
    province: initialData?.province ?? '',
    island: initialData?.island ?? '',
    ethnicGroup: initialData?.ethnicGroup ?? '',
    clothingType: initialData?.clothingType ?? '',
    motifLabel: initialData?.motifLabel ?? '',
    gender: initialData?.gender ?? null,
    readMinutes: initialData?.readMinutes ?? 6,
    featured: initialData?.featured ?? false,
    status: initialData?.status ?? ArticleStatus.published,
    summary: initialData?.summary ?? '',
    description: initialData?.description ?? '',
    imageURL: initialData?.imageURL ?? '',
    sections: initialData?.sections?.length
      ? initialData.sections.map((s, i) => ({
          title: s.title,
          content: s.content,
          imageURL: s.imageURL ?? '',
          order: i,
        }))
      : [{ title: '', content: '', imageURL: '', order: 0 }],
  };

  const form = useForm<CreateArticleInput>({
    resolver: zodResolver(
      isEdit ? updateArticleSchema : createArticleSchema,
    ) as Resolver<CreateArticleInput>,
    defaultValues,
  });
  const { handleSubmit, reset } = form;

  const onInvalid = () => {
    toast.error('Masih ada field yang belum diisi dengan benar.');
  };

  const onSubmit = (data: CreateArticleInput) => {
    // Normalize empty imageURL strings to undefined so backend treats them as missing
    const normalize = (d: CreateArticleInput) => {
      const copy: Record<string, unknown> = { ...d };
      if (copy.imageURL === '') copy.imageURL = undefined;
      if (Array.isArray(copy.sections)) {
        copy.sections = copy.sections.map((s: Record<string, unknown>) => ({
          ...s,
          imageURL: s.imageURL === '' ? undefined : s.imageURL,
        }));
      }
      return copy as CreateArticleInput;
    };
    const payload = normalize(data);
    if (isEdit && initialData) {
      updateArticle(
        { slug: initialData.slug, data: payload },
        {
          onSuccess: () => {
            toast.success('Artikel berhasil diperbarui');
            onClose();
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Gagal memperbarui artikel',
            );
          },
        },
      );
    } else {
      createArticle(payload, {
        onSuccess: () => {
          toast.success('Artikel berhasil ditambahkan');
          reset();
          onClose();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Gagal menambahkan artikel',
          );
        },
      });
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className={cn(
            'relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-surface transition-all duration-300',
            isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95',
          )}
        >
          {/* Header */}
          <div className="border-b border-border bg-card px-6 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen
                  className="shrink-0 size-5 text-brand"
                  strokeWidth={1.75}
                />
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    {isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}
                  </h2>
                  <p className="text-[13px] text-ink-soft">
                    Field bertanda <span className="text-destructive">*</span>{' '}
                    wajib diisi
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup"
                onClick={onClose}
                className="cursor-pointer rounded-full bg-surface text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                <X className="size-4" />
              </Button>
            </div>

            <FormProgress />
          </div>

          {/* Body */}
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5 md:px-8">
            <WikipediaImportPanel isOpen={isOpen} />

            {/* 1. Informasi Dasar */}
            <BasicInfoSection
              fieldOptions={fieldOptions}
              isLoadingFieldOptions={isLoadingFieldOptions}
            />

            {/* 2. Asal Daerah */}
            <RegionSection />

            {/* 3. Detail */}
            <DetailsSection
              fieldOptions={fieldOptions}
              isLoadingFieldOptions={isLoadingFieldOptions}
            />

            {/* 4. Konten & Gambar */}
            <SummarySection />

            {/* 5. Bagian artikel */}
            <ArticleSectionsSection />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 cursor-pointer rounded-full border-border bg-card px-6 text-ink-soft hover:bg-surface"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 min-w-44 cursor-pointer gap-2 rounded-full bg-brand px-6 text-on-field transition-all hover:bg-brand-strong"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Tambah Artikel'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
