'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArticleStatus } from '@/generated/prisma/enums';
import { useCreateArticle, useUpdateArticle } from '@/hooks/use-article';
import { useWikipediaSummaryImport } from '@/hooks/use-wikipedia-summary';
import {
  type CreateArticleInput,
  createArticleSchema,
  updateArticleSchema,
} from '@/schemas/article.schema';
import { type EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { zodResolver } from '@hookform/resolvers/zod';
import { kabupaten, provinsi } from 'daftar-wilayah-indonesia';
import { Download, Loader2, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  type Resolver,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { toast } from 'sonner';

const MAJOR_ISLANDS = [
  'Jawa',
  'Sumatera',
  'Kalimantan',
  'Sulawesi',
  'Papua',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Maluku',
  'Maluku Utara',
  'Kepulauan Riau',
  'Bangka Belitung',
];

const ALL_PROVINCES = provinsi();

const ISLAND_TO_PROVINCE_CODES: Record<string, string[]> = {
  Jawa: ['31', '32', '33', '34', '35', '36'],
  Sumatera: ['11', '12', '13', '14', '15', '16', '17', '18'],
  Kalimantan: ['61', '62', '63', '64', '65'],
  Sulawesi: ['71', '72', '73', '74', '75', '76'],
  Papua: ['91', '92', '93', '94', '95', '96'],
  Bali: ['51'],
  'Nusa Tenggara Barat': ['52'],
  'Nusa Tenggara Timur': ['53'],
  Maluku: ['81'],
  'Maluku Utara': ['82'],
  'Kepulauan Riau': ['21'],
  'Bangka Belitung': ['19'],
};

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
  const [showModal, setShowModal] = useState(isOpen);
  const [showWikiReminder, setShowWikiReminder] = useState(false);
  const { mutate: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle();

  const isEdit = !!initialData;
  const isPending = isCreating || isUpdating;

  const wiki = useWikipediaSummaryImport(isOpen);

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

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateArticleInput>({
    resolver: zodResolver(
      isEdit ? updateArticleSchema : createArticleSchema,
    ) as Resolver<CreateArticleInput>,
    defaultValues,
  });

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });

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
      toast.success('Data Wikipedia dan section diterapkan ke form.');
    } else {
      toast.success('Data Wikipedia diterapkan ke form.');
    }
    wiki.discardPreview();
    setShowWikiReminder(true);
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

  if (isOpen && !showModal) {
    setShowModal(true);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isOpen && !showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative w-full max-w-3xl bg-[#fefdfb] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 transform ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebdxc2]">
          <div className="flex items-center gap-3 text-foreground">
            <svg
              className="w-5 h-5 text-[#8c6b5d]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-lg font-semibold">
              {isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="bg-[#f3ede8] hover:bg-[#e6dcd5] rounded-full text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body / Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
          {/* Impor ringkasan Wikipedia (fetch di browser) */}
          <div className="rounded-2xl border border-[#e5ded5] bg-[#fdfaf7]/80 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Impor dari Wikipedia
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tempel URL artikel (mis.{' '}
                  <span className="font-mono text-[11px]">
                    https://id.wikipedia.org/wiki/Batik
                  </span>
                  ), lalu tarik ringkasan REST API tanpa menyalin manual.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://id.wikipedia.org/wiki/..."
                value={wiki.url}
                onChange={(e) => wiki.setUrl(e.target.value)}
                disabled={wiki.isLoading}
                className="h-11 flex-1 px-4 bg-white border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d]"
              />
              <Button
                type="button"
                variant="outline"
                disabled={
                  wiki.isLoading || !wiki.urlLooksValid || !!wiki.urlHint
                }
                onClick={() => void wiki.fetchSummary()}
                className="h-11 shrink-0 border-[#305645] text-[#305645] hover:bg-[#305645]/10 gap-2"
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
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50/90"
              >
                <AlertTitle>Gagal mengambil data</AlertTitle>
                <AlertDescription>{wiki.error}</AlertDescription>
              </Alert>
            )}

            {wiki.preview && (
              <div className="rounded-xl border border-[#cde3d8] bg-white p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#305645]">
                  Pratinjau — terapkan ke form
                </p>
                {wiki.preview.wikiType === 'disambiguation' && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                    Halaman ini berupa disambiguasi Wikipedia; ringkasan mungkin
                    pendek — selalu sesuaikan untuk konteks WastraNusa.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  {wiki.preview.mapped.imageURL ? (
                    <Image
                      src={wiki.preview.mapped.imageURL}
                      alt=""
                      width={112}
                      height={112}
                      unoptimized
                      className="w-full sm:w-28 h-28 object-cover rounded-lg border border-[#e5ded5] bg-[#f5f3ec]"
                    />
                  ) : (
                    <div className="w-full sm:w-28 h-28 rounded-lg border border-dashed border-[#e5ded5] bg-[#faf8f5] flex items-center justify-center text-[11px] text-muted-foreground text-center px-2">
                      Tidak ada gambar thumbnail
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-foreground leading-snug">
                      {wiki.preview.mapped.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {wiki.preview.mapped.summary}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#305645] hover:bg-[#264538] text-white"
                    onClick={handleApplyWikimediaPreview}
                  >
                    Terapkan ke form
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wiki.discardPreview}
                  >
                    Buang pratinjau
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Reminder: required fields not populated by Wikipedia */}
          {showWikiReminder && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <svg
                className="mt-0.5 size-4 shrink-0 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">
                  Lengkapi field berikut secara manual
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
                className="ml-1 rounded-lg p-0.5 text-amber-500 hover:bg-amber-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Judul Artikel */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Judul Artikel *
            </label>
            <Input
              {...register('title')}
              type="text"
              placeholder="Contoh: Sejarah Batik Jawa: Warisan Dunia UNESCO"
              className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d]"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Motif Label */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Label Motif *
              </label>
              <Input
                {...register('motifLabel')}
                type="text"
                placeholder="Batik Parang / Songket Palembang"
                className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d]"
              />
              {errors.motifLabel && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {errors.motifLabel.message}
                </p>
              )}
            </div>

            {/* Topik */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Topik *
              </label>
              <Input
                {...register('topic')}
                type="text"
                placeholder="Pakaian Adat / Tekstil"
                className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d]"
              />
              {errors.topic && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.topic.message}
                </p>
              )}
            </div>

            {/* Pulau */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Pulau *
              </label>
              <Controller
                control={control}
                name="island"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue('province', '');
                      setValue('region', '');
                    }}
                    value={field.value || undefined}
                  >
                    <SelectTrigger className="h-11 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground">
                      <SelectValue placeholder="Pilih Pulau" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJOR_ISLANDS.map((island) => (
                        <SelectItem key={island} value={island}>
                          {island}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.island && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.island.message}
                </p>
              )}
            </div>

            {/* Provinsi */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Provinsi *
              </label>
              <Controller
                control={control}
                name="province"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue('region', '');
                    }}
                    value={field.value || undefined}
                    disabled={!watchedIsland}
                  >
                    <SelectTrigger className="h-11 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground">
                      <SelectValue
                        placeholder={
                          watchedIsland
                            ? 'Pilih Provinsi'
                            : 'Pilih Pulau terlebih dahulu'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProvinces.map((p) => (
                        <SelectItem key={p.kode} value={p.nama}>
                          {p.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.province && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>

            {/* Daerah */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Daerah *
              </label>
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={!watchedProvince}
                  >
                    <SelectTrigger className="h-11 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground">
                      <SelectValue
                        placeholder={
                          watchedProvince
                            ? 'Pilih Daerah'
                            : 'Pilih Provinsi terlebih dahulu'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredKabupaten.map((k) => (
                        <SelectItem key={k.kode} value={k.nama}>
                          {k.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.region && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.region.message}
                </p>
              )}
            </div>

            {/* Read Minutes, Gender, Featured, Status */}
            <div className="block text-sm font-medium text-muted-foreground mb-1.5">
              {/* Estimasi Waktu Baca */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Estimasi Waktu Baca (Menit) *
                </label>
                <Input
                  {...register('readMinutes', { valueAsNumber: true })}
                  type="number"
                  placeholder="6"
                  className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground"
                />
                {errors.readMinutes && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.readMinutes.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Gender (Opsional)
                </label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <SelectTrigger className="h-11 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground">
                        <SelectValue placeholder="Pilih Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Laki-laki</SelectItem>
                        <SelectItem value="female">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Featured Toggle */}
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      {...register('featured')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#c26a3d]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c26a3d]"></div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Tampilkan di Featured
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ethnic Group */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Suku / Kelompok Etnis (Opsional)
              </label>
              <Input
                {...register('ethnicGroup')}
                type="text"
                placeholder="Contoh: Jawa / Dayak"
                className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground"
              />
              {errors.ethnicGroup && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.ethnicGroup.message}
                </p>
              )}
            </div>

            {/* Clothing Type */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Jenis Pakaian (Opsional)
              </label>
              <Input
                {...register('clothingType')}
                type="text"
                placeholder="Contoh: Kebaya / Batik"
                className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground"
              />
              {errors.clothingType && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.clothingType.message}
                </p>
              )}
            </div>
          </div>

          {/* Excerpt, Summary, Description */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Excerpt (Ringkasan Pendek) *
              </label>
              <textarea
                {...register('excerpt')}
                rows={2}
                placeholder="Teaser singkat yang muncul di kartu artikel..."
                className="w-full px-4 py-3 bg-[#fdfaf7] border border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d] transition-all resize-none"
              />
              {errors.excerpt && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.excerpt.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Ringkasan (Summary) (Opsional)
              </label>
              <textarea
                {...register('summary')}
                rows={3}
                placeholder="Ringkasan lengkap tentang isi artikel..."
                className="w-full px-4 py-3 bg-[#fdfaf7] border border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d] transition-all resize-none"
              />
              {errors.summary && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.summary.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Deskripsi Tambahan (Opsional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Detail informasi tambahan lainnya..."
                className="w-full px-4 py-3 bg-[#fdfaf7] border border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d] transition-all resize-none"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                URL Gambar Utama (Opsional)
              </label>
              <Input
                {...register('imageURL')}
                type="text"
                placeholder="https://example.com/image.jpg"
                className="h-11 px-4 bg-[#fdfaf7] border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d]"
              />
              {errors.imageURL && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.imageURL.message}
                </p>
              )}
            </div>
          </div>

          <hr className="border-[#ebdxc2]" />

          {/* Sections Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Konten Section
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ title: '', content: '', order: fields.length })
                }
                className="flex items-center gap-2 border-[#c26a3d] text-[#c26a3d] hover:bg-[#c26a3d]/10"
              >
                <Plus className="w-4 h-4" />
                Tambah Section
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-[#fdfaf7] border border-[#e5ded5] rounded-2xl space-y-4 relative"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Judul Section {index + 1} *
                  </label>
                  <Input
                    {...register(`sections.${index}.title` as const)}
                    placeholder="Contoh: Sejarah Singkat"
                    className="h-10 bg-white"
                  />
                  {errors.sections?.[index]?.title && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {errors.sections[index]?.title?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Isi Konten *
                  </label>
                  <textarea
                    {...register(`sections.${index}.content` as const)}
                    rows={4}
                    placeholder="Tuliskan isi detail section di sini..."
                    className="w-full px-4 py-3 bg-white border border-[#e5ded5] rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c26a3d]/30 focus-visible:border-[#c26a3d] transition-all resize-none"
                  />
                  {errors.sections?.[index]?.content && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {errors.sections[index]?.content?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    URL Gambar Section (Opsional)
                  </label>
                  <div className="flex items-start gap-3">
                    <Input
                      {...register(`sections.${index}.imageURL` as const)}
                      placeholder="https://example.com/section-image.jpg"
                      className="h-10 bg-white flex-1"
                    />
                    {/** preview if imageURL exists */}
                    {/** Use value from field so it updates immediately */}
                    <div className="w-20 h-12 bg-[#faf8f5] rounded-md flex items-center justify-center border border-dashed border-[#e5ded5]">
                      {(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const formValues = (control as any)._formValues;
                        const imageUrl =
                          formValues?.sections?.[index]?.imageURL;
                        return imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl as string}
                            alt=""
                            className="w-20 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-[11px] text-muted-foreground text-center">
                            No image
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  {errors.sections?.[index]?.imageURL && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {errors.sections[index]?.imageURL?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#ebd8c2] flex items-center gap-3 bg-[#fefdfb] rounded-b-2xl">
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 h-11 bg-[#c26a3d] hover:bg-[#a85b34] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-base"
          >
            {isPending ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            )}
            {isPending
              ? 'Menyimpan...'
              : isEdit
                ? 'Simpan Perubahan'
                : 'Tambah Artikel'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 h-11 bg-white border-[#e5ded5] text-muted-foreground hover:bg-muted rounded-xl font-medium transition-colors text-base"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
