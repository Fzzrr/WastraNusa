'use client';

import { inputClassName } from '@/components/form-sections';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWikipediaSummaryImport } from '@/hooks/use-wikipedia-summary';
import { cn } from '@/lib/utils';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { Download, Info, Loader2, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

export function WikipediaImportPanel({ isOpen }: { isOpen: boolean }) {
  const { setValue } = useFormContext<CreateArticleInput>();
  const [showWikiReminder, setShowWikiReminder] = useState(false);
  const wiki = useWikipediaSummaryImport(isOpen);

  const handleApplyWikimediaPreview = () => {
    if (!wiki.preview) return;
    const { mapped } = wiki.preview;
    setValue('title', mapped.title, { shouldDirty: true });
    setValue('excerpt', mapped.excerpt, { shouldDirty: true });
    setValue('summary', mapped.summary, { shouldDirty: true });
    setValue('description', mapped.description, { shouldDirty: true });
    if (mapped.imageURL) {
      setValue('imageURL', mapped.imageURL, { shouldDirty: true });
    }
    // If Wikipedia returned section headings, map them to form sections
    if (mapped.sections && mapped.sections.length > 0) {
      const mappedSections = mapped.sections.map((s, i) => ({
        title: s.title || '',
        content: s.content || '',
        imageURL: s.imageURL ?? '',
        order: i,
      }));
      setValue('sections', mappedSections, { shouldDirty: true });
      toast.success(
        'Data Wikipedia beserta bagian artikel diterapkan ke form.',
      );
    } else {
      toast.success('Data Wikipedia diterapkan ke form.');
    }
    wiki.discardPreview();
    setShowWikiReminder(true);
  };
  return (
    <>
      <div className="space-y-3 rounded-2xl bg-gradient-to-br from-[#eef3ee] to-[#f7f3ec] p-4 ring-1 ring-[#d5e2d8]">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#3a5a4a] text-[#e8cb8d]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-[#2f4f3f]">
              Isi Cepat dari Wikipedia
            </p>
            <p className="mt-0.5 text-xs text-[#6f6a62]">
              Tempel URL artikel (mis.{' '}
              <span className="font-mono text-xs">
                https://id.wikipedia.org/wiki/Batik
              </span>
              ), lalu tarik ringkasan REST API tanpa menyalin manual.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://id.wikipedia.org/wiki/..."
            value={wiki.url}
            onChange={(e) => wiki.setUrl(e.target.value)}
            disabled={wiki.isLoading}
            className={cn(inputClassName, 'flex-1')}
          />
          <Button
            type="button"
            disabled={wiki.isLoading || !wiki.urlLooksValid || !!wiki.urlHint}
            onClick={() => void wiki.fetchSummary()}
            className="h-11 shrink-0 cursor-pointer gap-2 rounded-xl bg-[#3a5a4a] px-4 text-white hover:bg-[#2f4b3d]"
          >
            {wiki.isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memuat…
              </>
            ) : (
              <>
                <Download className="size-4" aria-hidden />
                Tarik Data
              </>
            )}
          </Button>
        </div>

        {wiki.url.trim().length > 0 && wiki.urlHint && (
          <p className="text-xs text-amber-700">{wiki.urlHint}</p>
        )}

        {wiki.error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50/90">
            <AlertTitle>Gagal Mengambil Data</AlertTitle>
            <AlertDescription>{wiki.error}</AlertDescription>
          </Alert>
        )}

        {wiki.preview && (
          <div className="animate-in space-y-3 rounded-xl bg-white p-3 ring-1 ring-[#cde3d8] fade-in slide-in-from-top-1">
            <p className="text-xs font-semibold tracking-wide text-[#305645] uppercase">
              Pratinjau — Terapkan ke Form
            </p>
            {wiki.preview.wikiType === 'disambiguation' && (
              <p className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                Halaman ini berupa disambiguasi Wikipedia; ringkasan mungkin
                pendek — selalu sesuaikan untuk konteks WastraNusa.
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              {wiki.preview.mapped.imageURL ? (
                <Image
                  src={wiki.preview.mapped.imageURL}
                  alt=""
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-full rounded-lg border border-[#e5ded5] bg-[#f5f3ec] object-cover sm:w-28"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-[#e5ded5] bg-[#faf8f5] px-2 text-center text-xs text-muted-foreground sm:w-28">
                  Tidak ada gambar thumbnail
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="leading-snug font-medium text-foreground">
                  {wiki.preview.mapped.title}
                </p>
                <p className="line-clamp-4 text-sm text-muted-foreground">
                  {wiki.preview.mapped.summary}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                className="cursor-pointer rounded-lg bg-[#305645] text-white hover:bg-[#264538]"
                onClick={handleApplyWikimediaPreview}
              >
                Terapkan ke Form
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer rounded-lg"
                onClick={wiki.discardPreview}
              >
                Buang Pratinjau
              </Button>
            </div>
          </div>
        )}
      </div>

      {showWikiReminder && (
        <div className="flex animate-in items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 fade-in">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="font-semibold">
              Lengkapi Field Berikut secara Manual
            </p>
            <p className="mt-0.5 text-amber-700">
              Wikipedia tidak dapat mengisi:{' '}
              <span className="font-medium">
                Label Motif, Topik, Pulau, Provinsi, Daerah
              </span>
              . Field-field ini wajib diisi sebelum menyimpan artikel.
            </p>
          </div>
          <button
            type="button"
            aria-label="Tutup peringatan"
            onClick={() => setShowWikiReminder(false)}
            className="ml-1 cursor-pointer rounded-lg p-0.5 text-amber-500 transition-colors hover:bg-amber-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
