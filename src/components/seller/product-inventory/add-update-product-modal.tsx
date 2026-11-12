'use client';

import {
  ChoicePills,
  Field,
  FormSection,
  GENDER_CHOICES,
  ImagePreview,
  inputClassName,
  textareaClassName,
} from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModalPresence } from '@/hooks/use-modal-presence';
import {
  useClothingTypeOptions,
  useCreateSellerProduct,
  useUpdateSellerProduct,
} from '@/hooks/use-seller-product';
import { cn, formatIDR } from '@/lib/utils';
import {
  type CreateProductInput,
  type UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from '@/schemas/product.schema';
import { type ProductInventoryItem } from '@/types/product';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Loader2, Package, Save, Tag } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { ArticleSelectField } from './article-select-field';
import {
  ClothingTypeField,
  PriceInput,
  ProductFormHeader,
  VariantsSection,
  buildProductFormValues,
  slugify,
} from './product-form-fields';

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProductInventoryItem | null;
}

export default function AddUpdateProductModal({
  isOpen,
  onClose,
  initialData,
}: ProductFormModalProps) {
  const isMounted = useModalPresence(isOpen);

  const { mutate: createProduct, isPending: isCreating } =
    useCreateSellerProduct();
  const { mutate: updateProduct, isPending: isUpdating } =
    useUpdateSellerProduct();
  const { data: clothingTypeOptions = [], refetch: refetchClothingTypes } =
    useClothingTypeOptions();
  const isEdit = Boolean(initialData);
  const isPending = isCreating || isUpdating;

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

  const values = useWatch({ control });
  const nameValue = values.name;
  const variants = values.variants ?? [];

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

  useEffect(() => {
    if (!isOpen) return;
    reset(buildProductFormValues(initialData));
    // Pick up clothing types other users added since the last open.
    void refetchClothingTypes();
  }, [initialData, isOpen, reset, refetchClothingTypes]);

  if (!isMounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className={cn(
          'relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-surface transition-all duration-300',
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95',
        )}
      >
        <ProductFormHeader
          title={isEdit ? 'Edit Produk & Inventori' : 'Tambah Produk Baru'}
          subtitle={
            isEdit && initialData ? (
              initialData.name
            ) : (
              <>
                Field bertanda <span className="text-destructive">*</span> wajib
                diisi
              </>
            )
          }
          filledCount={filledCount}
          totalCount={requiredChecks.length}
          onClose={onClose}
        />

        {/* Body */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5 md:px-8">
          <FormSection
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
                      <span className="rounded-md bg-surface px-1.5 py-0.5 tabular-nums text-[13px] text-ink-soft">
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
              <ArticleSelectField
                control={control}
                error={errors.articleId?.message}
                initialData={initialData}
              />
            </div>
          </FormSection>

          <FormSection
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
                  <ChoicePills
                    ariaLabel="Gender"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    options={GENDER_CHOICES}
                  />
                )}
              />
            </Field>
          </FormSection>

          <FormSection
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

          <VariantsSection
            control={control}
            register={register}
            errors={errors}
          />
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
                : 'Tambah Produk'}
          </Button>
        </div>
      </form>
    </div>
  );
}
