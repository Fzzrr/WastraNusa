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
      <div
        className="absolute inset-0 bg-[#1f2a24]/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className={cn(
            'relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#f7f3ec] shadow-2xl transition-all duration-300',
            isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95',
          )}
        >
          {/* Header */}
          <div className="border-b border-[#ebe3d6] bg-[#fffdfa] px-6 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d]">
                  <BookOpen className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#2f4f3f]">
                    {isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}
                  </h2>
                  <p className="text-xs text-[#9a8f80]">
                    Field bertanda <span className="text-[#c26a3d]">*</span>{' '}
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
                className="cursor-pointer rounded-full bg-[#f4efe5] text-[#6f6a62] transition-colors hover:bg-[#ebe3d6] hover:text-[#2f3a33]"
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
          <div className="flex items-center justify-end gap-3 border-t border-[#ebe3d6] bg-[#fffdfa] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 cursor-pointer rounded-xl border-[#e5ded5] bg-white px-6 text-[#6f6a62] hover:bg-[#f4efe5]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 min-w-44 cursor-pointer gap-2 rounded-xl bg-[#3a5a4a] px-6 text-white shadow-[0_6px_16px_rgba(47,75,61,0.25)] transition-all hover:-translate-y-px hover:bg-[#2f4b3d]"
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
