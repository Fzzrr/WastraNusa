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
import { Gender, VariantType } from '@/generated/prisma/enums';
import {
  useArticleOptions,
  useClothingTypeOptions,
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
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { type UIEvent, useEffect, useRef, useState } from 'react';
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

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.male, label: 'Laki-laki' },
  { value: Gender.female, label: 'Perempuan' },
  { value: Gender.unisex, label: 'Unisex' },
];

const GENDER_NONE = '__none__';

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
    })) ?? [
      {
        name: '',
        type: VariantType.size,
        price: 0,
        stock: 0,
        sku: 'AUTO',
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

function ClothingTypeField({
  control,
}: {
  control: Control<CreateProductInput>;
}) {
  const { data: clothingTypeOptions = [] } = useClothingTypeOptions();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <Controller
      control={control}
      name="clothingType"
      render={({ field }) => {
        const filteredOptions = clothingTypeOptions.filter((type) =>
          type.toLowerCase().includes(search.trim().toLowerCase()),
        );
        const trimmedSearch = search.trim();
        const hasExactMatch = clothingTypeOptions.some(
          (type) => type.toLowerCase() === trimmedSearch.toLowerCase(),
        );

        const select = (value: string) => {
          field.onChange(value);
          setIsOpen(false);
          setSearch('');
        };

        return (
          <div ref={containerRef} className="relative">
            <div
              onClick={() => setIsOpen(true)}
              className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border border-[#e5ded5] bg-[#fdfaf7] px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#c26a3d]/30"
            >
              {field.value ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#f4ecdd] px-2 py-1 text-sm font-medium text-[#8f5a30]">
                  {field.value}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      field.onChange('');
                    }}
                    className="rounded-full p-0.5 text-[#a98a63] hover:bg-[#e9dcc8] hover:text-[#8f5a30]"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ) : null}
              <input
                value={isOpen ? search : ''}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder={field.value ? '' : 'Pilih atau buat jenis pakaian'}
                className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {isOpen ? (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#e5ded5] bg-white shadow-lg">
                <p className="border-b border-[#efe8de] px-3 py-2 text-xs font-medium text-muted-foreground">
                  Pilih opsi atau buat baru
                </p>
                <div className="max-h-48 overflow-y-auto py-1">
                  {filteredOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => select(type)}
                      className="flex w-full items-center px-3 py-2 text-left text-sm text-foreground hover:bg-[#f4ecdd]"
                    >
                      {type}
                    </button>
                  ))}
                  {trimmedSearch && !hasExactMatch ? (
                    <button
                      type="button"
                      onClick={() => select(trimmedSearch)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-[#f4ecdd]"
                    >
                      <span className="text-muted-foreground">Buat</span>
                      <span className="rounded-md bg-[#f4ecdd] px-2 py-0.5 font-medium text-[#8f5a30]">
                        {trimmedSearch}
                      </span>
                    </button>
                  ) : null}
                  {filteredOptions.length === 0 && !trimmedSearch ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Belum ada jenis pakaian.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        );
      }}
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
  const imageURL = useWatch({ control, name: `variants.${index}.imageURL` });
  const variantErrors = errors.variants?.[index];

  return (
    <div className="space-y-4 rounded-2xl border border-[#e5ded5] bg-[#fdfaf7] p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#c26a3d]/10 text-[#c26a3d]">
            <Layers className="size-3.5" />
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
    if (!nameValue) return;
    const slug = slugify(nameValue);
    setValue('slug', slug, { shouldValidate: false });
    setValue('sku', slug.toUpperCase(), { shouldValidate: false });
  }, [nameValue, setValue]);

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
                      <SelectTrigger className="h-11 w-full rounded-xl border-[#e5ded5] bg-[#fdfaf7] text-foreground data-[size=default]:h-11">
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
                <ClothingTypeField control={control} />
                {errors.clothingType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.clothingType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Gender (Opsional)
                </label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? GENDER_NONE}
                      onValueChange={(value) =>
                        field.onChange(value === GENDER_NONE ? null : value)
                      }
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-[#e5ded5] bg-[#fdfaf7] text-foreground data-[size=default]:h-11">
                        <SelectValue placeholder="Pilih gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GENDER_NONE}>
                          Tidak ditentukan
                        </SelectItem>
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
                    sku: 'AUTO',
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
