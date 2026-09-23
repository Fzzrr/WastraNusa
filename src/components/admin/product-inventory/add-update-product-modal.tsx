'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gender, ProductStatus, VariantType } from '@/generated/prisma/enums';
import {
  useArticleOptions,
  useCreateProductInventory,
  useUpdateProductInventory,
} from '@/hooks/use-product-inventory';
import {
  type CreateProductInput,
  type UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from '@/schemas/product.schema';
import { type ProductInventoryItem } from '@/types/product';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Image as ImageIcon,
  Layers,
  type LucideIcon,
  Package,
  Palette,
  Plus,
  Ruler,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { type UIEvent, useEffect, useState } from 'react';
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

interface AddUpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProductInventoryItem | null;
}

const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: ProductStatus.active, label: 'Aktif' },
  { value: ProductStatus.inactive, label: 'Nonaktif' },
  { value: ProductStatus.out_of_stock, label: 'Habis' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.male, label: 'Laki-laki' },
  { value: Gender.female, label: 'Perempuan' },
];

const VARIANT_TYPE_OPTIONS: { value: VariantType; label: string }[] = [
  { value: VariantType.size, label: 'Ukuran' },
  { value: VariantType.color, label: 'Warna' },
];

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
    gender: initialData?.gender ?? Gender.female,
    status: initialData?.status ?? ProductStatus.active,
    imageURL: initialData?.imageURL ?? '',
    variants: initialData?.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      type: variant.type,
      price: variant.price ?? Number.NaN,
      stock: variant.stock,
      sku: variant.sku,
      imageURL: variant.imageURL ?? '',
    })) ?? [
      {
        name: '',
        type: VariantType.size,
        price: 0,
        stock: 0,
        sku: '',
        imageURL: '',
      },
    ],
  };
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#c26a3d]/10 text-[#c26a3d]">
        <Icon className="size-4" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-xs text-[#8f8377]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function ImagePreviewThumb({ url, alt }: { url?: string | null; alt: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const isValidUrl = Boolean(url) && /^https?:\/\//.test(url ?? '');
  const showImage = isValidUrl && url !== failedUrl;

  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e5ded5] bg-[#f3ede8]">
      {showImage ? (
        <Image
          src={url as string}
          alt={alt}
          width={44}
          height={44}
          unoptimized
          className="size-full object-cover"
          onError={() => setFailedUrl(url ?? null)}
        />
      ) : (
        <ImageIcon className="size-4 text-[#b5aa9c]" />
      )}
    </div>
  );
}

function PriceInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        Rp
      </span>
      <Input
        type="number"
        min={0}
        className={`pl-9 ${className ?? ''}`}
        {...props}
      />
    </div>
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
  const type = useWatch({ control, name: `variants.${index}.type` });
  const imageURL = useWatch({ control, name: `variants.${index}.imageURL` });
  const TypeIcon = type === VariantType.color ? Palette : Ruler;
  const variantErrors = errors.variants?.[index];

  return (
    <div className="space-y-4 rounded-2xl border border-[#e5ded5] bg-[#fdfaf7] p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#c26a3d]/10 text-[#c26a3d]">
            <TypeIcon className="size-3.5" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Varian {index + 1}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          title={canRemove ? 'Hapus varian' : 'Minimal 1 varian diperlukan'}
          className="text-red-400 hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Nama Varian *
          </label>
          <Input
            {...register(`variants.${index}.name` as const)}
            placeholder="Ukuran M / Warna Merah"
          />
          {variantErrors?.name && (
            <p className="mt-1 text-xs text-red-500">
              {variantErrors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Tipe Varian *
          </label>
          <Controller
            control={control}
            name={`variants.${index}.type` as const}
            render={({ field: variantField }) => (
              <Select
                value={variantField.value}
                onValueChange={variantField.onChange}
              >
                <SelectTrigger className="h-10 bg-white text-foreground">
                  <SelectValue placeholder="Pilih tipe varian" />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {variantErrors?.type && (
            <p className="mt-1 text-xs text-red-500">
              {variantErrors.type.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            SKU Varian *
          </label>
          <Input
            {...register(`variants.${index}.sku` as const)}
            placeholder="BTK-PRG-M"
          />
          {variantErrors?.sku && (
            <p className="mt-1 text-xs text-red-500">
              {variantErrors.sku.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Stok Varian *
          </label>
          <Input
            {...register(`variants.${index}.stock` as const, {
              valueAsNumber: true,
            })}
            type="number"
            min={0}
            placeholder="10"
          />
          {variantErrors?.stock && (
            <p className="mt-1 text-xs text-red-500">
              {variantErrors.stock.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            URL Gambar Varian (Opsional)
          </label>
          <div className="flex items-center gap-3">
            <Input
              {...register(`variants.${index}.imageURL` as const)}
              placeholder="https://example.com/variant-image.jpg"
              className="flex-1"
            />
            <ImagePreviewThumb
              url={imageURL}
              alt={`Pratinjau varian ${index + 1}`}
            />
          </div>
          {variantErrors?.imageURL && (
            <p className="mt-1 text-xs text-red-500">
              {variantErrors.imageURL.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Harga Varian *
          </label>
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
          <p className="mt-1 text-xs text-muted-foreground">
            Harga ini adalah harga jual langsung untuk varian, bukan tambahan
            dari harga produk utama.
          </p>
          {variantErrors?.price && (
            <p className="mt-1 text-xs text-red-500">
              {variantErrors.price.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddUpdateProductModal({
  isOpen,
  onClose,
  initialData,
}: AddUpdateProductModalProps) {
  const [showModal, setShowModal] = useState(isOpen);

  const { mutate: createProduct, isPending: isCreating } =
    useCreateProductInventory();
  const { mutate: updateProduct, isPending: isUpdating } =
    useUpdateProductInventory();
  const {
    data: articleOptionPages,
    isLoading: isLoadingArticles,
    hasNextPage: hasNextArticlePage,
    isFetchingNextPage: isFetchingNextArticlePage,
    fetchNextPage: fetchNextArticlePage,
  } = useArticleOptions();

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
    getValues,
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

  const nameValue = useWatch({ control, name: 'name' });
  const productImageURL = useWatch({ control, name: 'imageURL' });

  useEffect(() => {
    if (isEdit || !nameValue) return;
    if (!getValues('slug')) {
      setValue('slug', slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEdit, getValues, setValue]);

  const onSubmit = (data: CreateProductInput) => {
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
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isOpen && !showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-[#fefdfb] shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#ebd8c2] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEdit ? 'Edit Produk & Inventori' : 'Tambah Produk Baru'}
            </h2>
            {isEdit && initialData ? (
              <p className="text-xs text-[#8f8377]">{initialData.name}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-full bg-[#f3ede8] text-muted-foreground hover:bg-[#e6dcd5]"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-7 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <SectionHeader icon={Package} title="Informasi Dasar" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Artikel Terkait *
                </label>
                <Controller
                  control={control}
                  name="articleId"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isLoadingArticles}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-[#e5ded5] bg-[#fdfaf7] text-foreground">
                        <SelectValue
                          placeholder="Pilih artikel"
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
                            className="h-9 overflow-hidden whitespace-nowrap text-ellipsis"
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
                {errors.articleId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.articleId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Nama Produk *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Contoh: Batik Parang Premium"
                  className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Slug Produk *
                </label>
                <Input
                  {...register('slug')}
                  placeholder="batik-parang-premium"
                  className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                {!isEdit ? (
                  <p className="mt-1 text-xs text-[#8f8377]">
                    Terisi otomatis dari nama produk, bisa diubah manual.
                  </p>
                ) : null}
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  SKU Produk *
                </label>
                <Input
                  {...register('sku')}
                  placeholder="BTK-PRG-001"
                  className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                {errors.sku && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader icon={Tag} title="Harga & Klasifikasi" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Harga *
                </label>
                <PriceInput
                  {...register('price', { valueAsNumber: true })}
                  placeholder="150000"
                  className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Berat (gram) *
                </label>
                <Input
                  {...register('weight', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="500"
                  className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                {errors.weight && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.weight.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Jenis Pakaian *
                </label>
                <Input
                  {...register('clothingType')}
                  placeholder="Batik"
                  className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                {errors.clothingType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.clothingType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Gender *
                </label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7] text-foreground">
                        <SelectValue placeholder="Pilih gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Status Produk *
                </label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 rounded-xl border-[#e5ded5] bg-[#fdfaf7] text-foreground">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeader icon={ImageIcon} title="Media & Deskripsi" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                URL Gambar Produk (Opsional)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  {...register('imageURL')}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 flex-1 rounded-xl border-[#e5ded5] bg-[#fdfaf7]"
                />
                <ImagePreviewThumb
                  url={productImageURL}
                  alt="Pratinjau produk"
                />
              </div>
              {errors.imageURL && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.imageURL.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Deskripsi (Opsional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Deskripsi singkat produk..."
                className="w-full rounded-xl border border-[#e5ded5] bg-[#fdfaf7] px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:border-[#c26a3d] focus-visible:ring-2 focus-visible:ring-[#c26a3d]/30 focus-visible:outline-none"
              />
            </div>
          </div>

          <hr className="border-[#ebd8c2]" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                icon={Layers}
                title="Varian Produk"
                description="Produk wajib memiliki minimal 1 varian."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: '',
                    type: VariantType.size,
                    price: 0,
                    stock: 0,
                    sku: '',
                    imageURL: '',
                  })
                }
                className="flex shrink-0 items-center gap-2 border-[#c26a3d] text-[#c26a3d] hover:bg-[#c26a3d]/10"
              >
                <Plus className="size-4" />
                Tambah Varian
              </Button>
            </div>

            {errors.variants?.message ? (
              <p className="text-sm text-red-500">{errors.variants.message}</p>
            ) : null}

            <div className="space-y-4">
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
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-b-2xl border-t border-[#ebd8c2] bg-[#fefdfb] px-6 py-4">
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 flex-1 rounded-xl bg-[#c26a3d] text-base text-white hover:bg-[#a85b34]"
          >
            {isPending
              ? 'Menyimpan...'
              : isEdit
                ? 'Simpan Perubahan'
                : 'Tambah Produk'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 rounded-xl border-[#e5ded5] bg-white px-6 text-base text-muted-foreground hover:bg-muted"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
