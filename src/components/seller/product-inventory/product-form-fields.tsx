'use client';

import {
  CreatableCombobox,
  Field,
  FormSection,
  ImagePreview,
  inputClassName,
} from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VariantType } from '@/generated/prisma/enums';
import { cn } from '@/lib/utils';
import { type CreateProductInput } from '@/schemas/product.schema';
import { type ProductInventoryItem } from '@/types/product';
import { Layers, Package, Plus, Trash2, X } from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
  useWatch,
} from 'react-hook-form';

/** Form pieces and helpers for the seller product form. */

export const EMPTY_VARIANT = {
  name: '',
  type: VariantType.size,
  price: 0,
  stock: 0,
  sku: 'AUTO',
  imageURL: '',
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildProductFormValues(
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

export function PriceInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[15px] font-medium text-ink-soft">
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

export function ClothingTypeField({
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

export function VariantCard({
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
    <div className="animate-in space-y-4 rounded-xl border-l-4 border-gold bg-surface p-4 ring-1 ring-border transition-shadow fade-in slide-in-from-bottom-1">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-[15px] font-semibold text-ink">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] text-on-field">
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
          className="cursor-pointer rounded-full text-ink-soft hover:bg-red-50 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
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

export function ProductFormHeader({
  title,
  subtitle,
  filledCount,
  totalCount,
  onClose,
}: {
  title: string;
  subtitle: ReactNode;
  filledCount: number;
  totalCount: number;
  onClose: () => void;
}) {
  const progress = Math.round((filledCount / totalCount) * 100);

  return (
    <div className="border-b border-border bg-card px-6 pt-5 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Package className="shrink-0 size-5 text-brand" strokeWidth={1.75} />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <p className="truncate text-[13px] text-ink-soft">{subtitle}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Tutup"
          onClick={onClose}
          className="cursor-pointer rounded-full bg-surface text-ink-soft hover:bg-surface hover:text-ink"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progress === 100 ? 'bg-brand' : 'bg-gold',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          className={cn(
            'text-[13px] font-medium whitespace-nowrap tabular-nums',
            progress === 100 ? 'text-ink' : 'text-ink-soft',
          )}
        >
          {filledCount}/{totalCount} Bagian Wajib
        </span>
      </div>
    </div>
  );
}

export function VariantsSection({
  control,
  register,
  errors,
}: {
  control: Control<CreateProductInput>;
  register: UseFormRegister<CreateProductInput>;
  errors: FieldErrors<CreateProductInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });
  const variants = useWatch({ control, name: 'variants' }) ?? [];
  const totalStock = variants.reduce(
    (sum, variant) =>
      sum + (Number.isFinite(variant?.stock) ? Number(variant?.stock) : 0),
    0,
  );

  return (
    <FormSection
      icon={Layers}
      title="Varian Produk"
      description={`${fields.length} varian · total stok ${totalStock.toLocaleString('id-ID')} unit`}
      aside={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_VARIANT)}
          className="cursor-pointer gap-1.5 rounded-lg border-brand/30 text-ink hover:bg-surface hover:text-ink"
        >
          <Plus className="size-4" />
          Tambah Varian
        </Button>
      }
    >
      {errors.variants?.message ? (
        <p className="mb-3 text-base text-destructive">
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
  );
}
