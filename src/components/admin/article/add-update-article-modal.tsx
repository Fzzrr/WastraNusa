'use client';

import {
  ChoicePills,
  CreatableCombobox,
  Field,
  FormSection,
  GENDER_CHOICES,
  ImagePreview,
  inputClassName,
  selectContentClassName,
  selectItemClassName,
  selectTriggerClassName,
  textareaClassName,
} from '@/components/form-sections';
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
import {
  useArticleFieldOptions,
  useCreateArticle,
  useUpdateArticle,
} from '@/hooks/use-article';
import { useWikipediaSummaryImport } from '@/hooks/use-wikipedia-summary';
import { cn } from '@/lib/utils';
import {
  type CreateArticleInput,
  createArticleSchema,
  updateArticleSchema,
} from '@/schemas/article.schema';
import { type EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { zodResolver } from '@hookform/resolvers/zod';
import { kabupaten, provinsi } from 'daftar-wilayah-indonesia';
import {
  BookOpen,
  Download,
  FileText,
  Info,
  Layers,
  Loader2,
  Map as MapIcon,
  MapPin,
  MapPinned,
  Plus,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
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

const EXCERPT_SOFT_LIMIT = 160;

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
  const watchedValues = useWatch({ control });
  const excerptLength = watchedValues.excerpt?.length ?? 0;

  const requiredFields = [
    watchedValues.title,
    watchedValues.motifLabel,
    watchedValues.topic,
    watchedValues.island,
    watchedValues.province,
    watchedValues.region,
    watchedValues.excerpt,
  ];
  const filledCount = requiredFields.filter((value) => value?.trim()).length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);

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
      toast.success(
        'Data Wikipedia beserta bagian artikel diterapkan ke form.',
      );
    } else {
      toast.success('Data Wikipedia diterapkan ke form.');
    }
    wiki.discardPreview();
    setShowWikiReminder(true);
  };

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
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div
        className="absolute inset-0 bg-[#1f2a24]/45 backdrop-blur-sm"
        onClick={onClose}
      />

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
                  Field bertanda <span className="text-[#c26a3d]">*</span> wajib
                  diisi
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

          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#efe8dd]">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress === 100 ? 'bg-[#3a5a4a]' : 'bg-[#d2a36d]',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              className={cn(
                'text-xs font-medium whitespace-nowrap tabular-nums',
                progress === 100 ? 'text-[#2f5543]' : 'text-[#9a8f80]',
              )}
            >
              {filledCount}/{requiredFields.length} Field Wajib
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5 md:px-8">
          {/* Impor dari Wikipedia */}
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
                  <span className="font-mono text-[11px]">
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
                disabled={
                  wiki.isLoading || !wiki.urlLooksValid || !!wiki.urlHint
                }
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
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50/90"
              >
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
                    <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-[#e5ded5] bg-[#faf8f5] px-2 text-center text-[11px] text-muted-foreground sm:w-28">
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

          {/* 1. Informasi Dasar */}
          <FormSection
            step={1}
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
              <Field
                label="Label Motif"
                required
                error={errors.motifLabel?.message}
              >
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

          {/* 2. Asal Daerah */}
          <FormSection
            step={2}
            icon={MapPin}
            title="Asal Daerah"
            description="Tentukan Daerah Asal Wastra"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Pulau" required error={errors.island?.message}>
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
                      <SelectTrigger className={selectTriggerClassName}>
                        <MapIcon className="size-4 text-[#b08a5e]" />
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
                        field.onChange(val);
                        setValue('region', '');
                      }}
                      value={field.value || undefined}
                      disabled={!watchedIsland}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <MapPinned className="size-4 text-[#b08a5e]" />
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
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={!watchedProvince}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <MapPin className="size-4 text-[#b08a5e]" />
                        <SelectValue
                          placeholder={
                            watchedProvince ? 'Pilih Daerah' : 'Daerah'
                          }
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

          {/* 3. Detail */}
          <FormSection
            step={3}
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

            <label className="group mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#faf7f2] px-4 py-3 ring-1 ring-[#efe8dd] transition-colors hover:bg-[#f4efe5]">
              <div>
                <p className="text-sm font-medium text-[#3d3a34]">
                  Tampilkan di Featured
                </p>
                <p className="text-xs text-[#9a8f80]">
                  Artikel akan ditonjolkan di halaman ensiklopedia
                </p>
              </div>
              <span className="relative shrink-0">
                <input
                  {...register('featured')}
                  type="checkbox"
                  className="peer sr-only"
                />
                <span className="block h-6 w-11 rounded-full bg-[#ddd4c6] transition-colors peer-checked:bg-[#3a5a4a] peer-focus-visible:ring-4 peer-focus-visible:ring-[#3a5a4a]/20" />
                <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </FormSection>

          {/* 4. Konten & Gambar */}
          <FormSection
            step={4}
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
                      'text-xs tabular-nums',
                      excerptLength > EXCERPT_SOFT_LIMIT
                        ? 'text-[#c26a3d]'
                        : 'text-[#a39c92]',
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
              <Field
                label="Ringkasan (Summary)"
                error={errors.summary?.message}
              >
                <textarea
                  {...register('summary')}
                  rows={3}
                  placeholder="Ringkasan lengkap tentang isi artikel..."
                  className={textareaClassName}
                />
              </Field>
              <Field
                label="Deskripsi Tambahan"
                error={errors.description?.message}
              >
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
                  <ImagePreview
                    url={watchedValues.imageURL}
                    className="h-20 w-28"
                  />
                </div>
              </Field>
            </div>
          </FormSection>

          {/* 5. Bagian artikel */}
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
                      {watchedValues.sections?.[index]?.title?.trim() ||
                        `Bagian ${index + 1}`}
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
                        url={watchedValues.sections?.[index]?.imageURL}
                        className="h-11 w-20"
                      />
                    </div>
                  </Field>
                </div>
              ))}
            </div>
          </FormSection>
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
    </div>
  );
}
