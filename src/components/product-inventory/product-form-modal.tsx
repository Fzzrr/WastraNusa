'use client';

import {
  CreatableCombobox,
  Field,
  FormSection,
  ImagePreview,
  inputClassName,
  selectTriggerClassName,
  textareaClassName,
} from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gender, VariantType } from '@/generated/prisma/enums';
import { cn, formatIDR } from '@/lib/utils';
import {
  type CreateProductInput,
  type UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from '@/schemas/product.schema';
import {
  type ArticleOptionItem,
  type ProductInventoryItem,
} from '@/types/product';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  Check,
  ImageIcon,
  Layers,
  Loader2,
  Package,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { type ComponentProps, type UIEvent, useEffect, useState } from 'react';
import {
  type Control,
  Controller,
  type FieldErrors,
  type Resolver,
  type UseFormRegister,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Data hooks differ between the admin inventory and a seller's own shop; the
 * form itself is identical, so each side passes its hooks in.
 */
export type ProductFormHooks = {
  useCreate: () => UseMutationResult<unknown, Error, CreateProductInput>;
  useUpdate: () => UseMutationResult<
    unknown,
    Error,
    { idOrSlug: string; data: UpdateProductInput }
  >;
  useArticleOptions: () => UseInfiniteQueryResult<
    InfiniteData<{ items: ArticleOptionItem[] }>
  >;
  useClothingTypeOptions: () => UseQueryResult<string[]>;
};

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProductInventoryItem | null;
}

const GENDER_OPTIONS: { value: Gender | null; label: string }[] = [
  { value: null, label: 'Tidak Ditentukan' },
  { value: Gender.male, label: 'Laki-laki' },
  { value: Gender.female, label: 'Perempuan' },
  { value: Gender.unisex, label: 'Unisex' },
];

const EMPTY_VARIANT = {
  name: '',
  type: VariantType.size,
  price: 0,
  stock: 0,
  sku: 'AUTO',
  imageURL: '',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildProductFormValues(
  initialData?: ProductInventoryItem | null,
): CreateProductInput {
  return {
    articleId: initialData?.articleId ?? '',
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? 0,
    sku: initialData?.sku ?? '',
    weight: initialData?.weight ?? 1,
    clothingType: initialData?.clothingType ?? '',
    gender: initialData?.gender ?? undefined,
    imageURL: initialData?.imageURL ?? '',
    variants: initialData?.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      type: variant.type,
      price: variant.price ?? Number.NaN,
      stock: variant.stock,
      sku: variant.sku,
      imageURL: variant.imageURL ?? '',
    })) ?? [EMPTY_VARIANT],
  };
}

function PriceInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-[#8a6a3a]">
        Rp
      </span>
      <Input
        type="number"
        min={0}
        className={cn(inputClassName, 'pl-11', className)}
        {...props}
      />
    </div>
  );
}

function ClothingTypeField({
  control,
  options,
}: {
  control: Control<CreateProductInput>;
  options: string[];
}) {
  return (
    <Controller
      control={control}
      name="clothingType"
      render={({ field }) => (
        <CreatableCombobox
          value={field.value}
          onChange={field.onChange}
          options={options}
          placeholder="Cari atau buat jenis pakaian"
          emptyText="Belum ada jenis pakaian."
        />
      )}
    />
  );
}

function VariantCard({
  control,
  register,
  errors,
  index,
  onRemove,
  canRemove,
}: {
  control: Control<CreateProductInput>;
  register: UseFormRegister<CreateProductInput>;
  errors: FieldErrors<CreateProductInput>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const variant = useWatch({ control, name: `variants.${index}` });
  const variantErrors = errors.variants?.[index];

  return (
    <div className="animate-in space-y-4 rounded-xl border-l-4 border-[#d2a36d] bg-[#faf7f2] p-4 ring-1 ring-[#efe8dd] transition-shadow fade-in slide-in-from-bottom-1 hover:shadow-[0_12px_24px_-18px_rgba(89,69,38,0.5)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#2f4f3f]">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3a5a4a] text-xs text-white">
            {index + 1}
          </span>
          <span className="truncate">
            {variant?.name?.trim() || `Varian ${index + 1}`}
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Hapus varian ${index + 1}`}
          title={canRemove ? 'Hapus varian' : 'Minimal 1 varian diperlukan'}
          className="cursor-pointer rounded-lg text-[#a39c92] hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <Field
          label="Nama Varian"
          required
          error={variantErrors?.name?.message}
        >
          <Input
            {...register(`variants.${index}.name` as const)}
            placeholder="Ukuran M / Warna Merah"
            className={inputClassName}
          />
        </Field>
        <Field label="Stok" required error={variantErrors?.stock?.message}>
          <Input
            {...register(`variants.${index}.stock` as const, {
              valueAsNumber: true,
            })}
            type="number"
            min={0}
            placeholder="10"
            className={inputClassName}
          />
        </Field>
        <Field label="Harga" required error={variantErrors?.price?.message}>
          <Controller
            control={control}
            name={`variants.${index}.price` as const}
            render={({ field: variantPriceField }) => (
              <PriceInput
                value={
                  typeof variantPriceField.value === 'number' &&
                  Number.isNaN(variantPriceField.value)
                    ? ''
                    : (variantPriceField.value ?? '')
                }
                onChange={(event) => {
                  const value = event.target.value;
                  variantPriceField.onChange(
                    value === '' ? Number.NaN : Number(value),
                  );
                }}
                placeholder="150000"
              />
            )}
          />
        </Field>
        <Field
          label="URL Gambar Varian"
          error={variantErrors?.imageURL?.message}
          hint="Harga varian adalah harga jual langsung, bukan tambahan dari harga produk."
          className="md:col-span-3"
        >
          <div className="flex items-start gap-3">
            <Input
              {...register(`variants.${index}.imageURL` as const)}
              placeholder="https://example.com/variant-image.jpg"
              className={cn(inputClassName, 'flex-1')}
            />
            <ImagePreview url={variant?.imageURL} className="h-11 w-16" />
          </div>
        </Field>
      </div>
    </div>
  );
}

export function ProductFormModal({
  isOpen,
  onClose,
  initialData,
  hooks,
}: ProductFormModalProps & { hooks: ProductFormHooks }) {
  const [showModal, setShowModal] = useState(isOpen);

  const { mutate: createProduct, isPending: isCreating } = hooks.useCreate();
  const { mutate: updateProduct, isPending: isUpdating } = hooks.useUpdate();
  const { data: clothingTypeOptions = [], refetch: refetchClothingTypes } =
    hooks.useClothingTypeOptions();
  const {
    data: articleOptionPages,
    isLoading: isLoadingArticles,
    hasNextPage: hasNextArticlePage,
    isFetchingNextPage: isFetchingNextArticlePage,
    fetchNextPage: fetchNextArticlePage,
  } = hooks.useArticleOptions();

  const isEdit = Boolean(initialData);
  const isPending = isCreating || isUpdating;
  const fetchedArticleOptions =
    articleOptionPages?.pages.flatMap((page) => page.items) ?? [];
  const articleOptions =
    initialData &&
    !fetchedArticleOptions.some(
      (article) => article.id === initialData.articleId,
    )
      ? [
          {
            id: initialData.articleId,
            title: initialData.articleTitle,
            island: initialData.island,
            province: initialData.province,
          },
          ...fetchedArticleOptions,
        ]
      : fetchedArticleOptions;

  const handleArticleSelectScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextArticlePage || isFetchingNextArticlePage) return;

    const container = event.currentTarget;
    const remainingScroll =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (remainingScroll < 60) {
      fetchNextArticlePage();
    }
  };
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(
      isEdit ? updateProductSchema : createProductSchema,
    ) as Resolver<CreateProductInput>,
    defaultValues: buildProductFormValues(initialData),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const values = useWatch({ control });
  const nameValue = values.name;
  const variants = values.variants ?? [];
  const totalStock = variants.reduce(
    (sum, variant) =>
      sum + (Number.isFinite(variant?.stock) ? Number(variant?.stock) : 0),
    0,
  );

  const requiredChecks = [
    Boolean(values.articleId),
    Boolean(values.name?.trim()),
    Number(values.price) > 0,
    Number(values.weight) > 0,
    Boolean(values.clothingType?.trim()),
    variants.length > 0 &&
      variants.every(
        (variant) =>
          Boolean(variant?.name?.trim()) && Number(variant?.price) > 0,
      ),
  ];
  const filledCount = requiredChecks.filter(Boolean).length;
  const progress = Math.round((filledCount / requiredChecks.length) * 100);

  useEffect(() => {
    if (!nameValue) return;
    const slug = slugify(nameValue);
    setValue('slug', slug, { shouldValidate: false });
    setValue('sku', slug.toUpperCase(), { shouldValidate: false });
  }, [nameValue, setValue]);

  const onInvalid = () => {
    toast.error('Masih ada field yang belum diisi dengan benar.');
  };

  const onSubmit = (formData: CreateProductInput) => {
    const data: CreateProductInput = {
      ...formData,
      variants: formData.variants.map((variant, index) => ({
        ...variant,
        sku: `${formData.sku}-V${index + 1}`,
      })),
    };

    if (isEdit && initialData) {
      const updateData: UpdateProductInput = { ...data };

      if (updateData.articleId === initialData.articleId) {
        delete updateData.articleId;
      }

      updateProduct(
        { idOrSlug: initialData.id, data: updateData },
        {
          onSuccess: () => {
            toast.success('Produk berhasil diperbarui');
            onClose();
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Gagal memperbarui produk',
            );
          },
        },
      );
      return;
    }
    createProduct(data, {
      onSuccess: () => {
        toast.success('Produk berhasil ditambahkan');
        reset();
        onClose();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Gagal menambahkan produk',
        );
      },
    });
  };

  if (isOpen && !showModal) {
    setShowModal(true);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      reset(buildProductFormValues(initialData));
      // Pick up clothing types other users added since the last open.
      void refetchClothingTypes();
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [initialData, isOpen, reset, refetchClothingTypes]);

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
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d]">
                <Package className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#2f4f3f]">
                  {isEdit ? 'Edit Produk & Inventori' : 'Tambah Produk Baru'}
                </h2>
                <p className="truncate text-xs text-[#9a8f80]">
                  {isEdit && initialData ? (
                    initialData.name
                  ) : (
                    <>
                      Field bertanda <span className="text-[#c26a3d]">*</span>{' '}
                      wajib diisi
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Tutup"
              onClick={onClose}
              className="cursor-pointer rounded-full bg-[#f4efe5] text-[#6f6a62] hover:bg-[#ebe3d6] hover:text-[#2f3a33]"
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
              {filledCount}/{requiredChecks.length} Bagian Wajib
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5 md:px-8">
          <FormSection
            step={1}
            icon={Package}
            title="Informasi Dasar"
            description="Nama produk dan artikel budaya yang terkait"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Nama Produk"
                required
                error={errors.name?.message}
                hint={
                  values.sku ? (
                    <span className="inline-flex items-center gap-1.5">
                      SKU otomatis:
                      <span className="rounded-md bg-[#f4efe5] px-1.5 py-0.5 font-mono text-[11px] text-[#6f6a62]">
                        {values.sku}
                      </span>
                    </span>
                  ) : (
                    'Slug & SKU dibuat otomatis dari nama produk.'
                  )
                }
              >
                <Input
                  {...register('name')}
                  placeholder="Contoh: Batik Parang Premium"
                  className={inputClassName}
                />
              </Field>
              <Field
                label="Artikel Terkait"
                required
                error={errors.articleId?.message}
                hint="Menghubungkan produk dengan kisah budayanya."
              >
                <Controller
                  control={control}
                  name="articleId"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isLoadingArticles}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue
                          placeholder={
                            isLoadingArticles
                              ? 'Memuat artikel…'
                              : 'Pilih artikel'
                          }
                          className="block w-full truncate"
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="max-h-72 overflow-y-auto"
                        onScroll={handleArticleSelectScroll}
                      >
                        {articleOptions.map((article) => (
                          <SelectItem
                            key={article.id}
                            value={article.id}
                            className="h-9 overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {article.title}
                          </SelectItem>
                        ))}
                        {isFetchingNextArticlePage ? (
                          <p className="px-2 py-2 text-xs text-muted-foreground">
                            Memuat artikel berikutnya...
                          </p>
                        ) : null}
                        {!hasNextArticlePage && articleOptions.length > 0 ? (
                          <p className="px-2 py-2 text-xs text-muted-foreground">
                            Semua artikel telah dimuat
                          </p>
                        ) : null}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            step={2}
            icon={Tag}
            title="Harga & Klasifikasi"
            description="Harga dasar, berat pengiriman, dan kategori"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Harga"
                required
                error={errors.price?.message}
                hint={
                  Number(values.price) > 0
                    ? formatIDR(Number(values.price))
                    : undefined
                }
              >
                <PriceInput
                  {...register('price', { valueAsNumber: true })}
                  placeholder="150000"
                />
              </Field>
              <Field
                label="Berat (gram)"
                required
                error={errors.weight?.message}
                hint="Dipakai untuk menghitung ongkir."
              >
                <Input
                  {...register('weight', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="500"
                  className={inputClassName}
                />
              </Field>
              <Field
                label="Jenis Pakaian"
                required
                error={errors.clothingType?.message}
              >
                <ClothingTypeField
                  control={control}
                  options={clothingTypeOptions}
                />
              </Field>
            </div>

            <Field
              label="Gender"
              error={errors.gender?.message}
              className="mt-4"
            >
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    aria-label="Gender"
                    className="flex flex-wrap gap-2"
                  >
                    {GENDER_OPTIONS.map((option) => {
                      const isActive = (field.value ?? null) === option.value;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-sm transition-all',
                            isActive
                              ? 'bg-[#3a5a4a] font-medium text-white shadow-[0_6px_14px_-6px_rgba(47,75,61,0.6)]'
                              : 'bg-white text-[#6f6a62] ring-1 ring-[#e5ded5] hover:text-[#2f5543] hover:ring-[#3a5a4a]/40',
                          )}
                        >
                          {isActive ? <Check className="size-3.5" /> : null}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>
          </FormSection>

          <FormSection
            step={3}
            icon={ImageIcon}
            title="Media & Deskripsi"
            description="Foto utama dan cerita singkat produk"
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <div className="space-y-4">
                <Field
                  label="URL Gambar Produk"
                  error={errors.imageURL?.message}
                  hint="Pratinjau muncul otomatis setelah URL diisi."
                >
                  <Input
                    {...register('imageURL')}
                    placeholder="https://example.com/image.jpg"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Deskripsi" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Ceritakan bahan, motif, dan keunikan produk..."
                    className={textareaClassName}
                  />
                </Field>
              </div>
              <ImagePreview
                url={values.imageURL}
                className="aspect-[4/5] w-full md:mt-6"
              />
            </div>
          </FormSection>

          <FormSection
            step={4}
            icon={Layers}
            title="Varian Produk"
            description={`${fields.length} varian · total stok ${totalStock.toLocaleString('id-ID')} unit`}
            aside={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(EMPTY_VARIANT)}
                className="cursor-pointer gap-1.5 rounded-lg border-[#3a5a4a]/30 text-[#2f5543] hover:bg-[#e7efe4] hover:text-[#2f5543]"
              >
                <Plus className="size-4" />
                Tambah Varian
              </Button>
            }
          >
            {errors.variants?.message ? (
              <p className="mb-3 text-sm text-red-600">
                {errors.variants.message}
              </p>
            ) : null}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <VariantCard
                  key={field.id}
                  control={control}
                  register={register}
                  errors={errors}
                  index={index}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
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
                : 'Tambah Produk'}
          </Button>
        </div>
      </form>
    </div>
  );
}
