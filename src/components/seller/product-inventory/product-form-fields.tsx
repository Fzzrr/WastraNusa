'use client';

import {
  CreatableCombobox,
  Field,
  ImagePreview,
  inputClassName,
} from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VariantType } from '@/generated/prisma/enums';
import { cn } from '@/lib/utils';
import { type CreateProductInput } from '@/schemas/product.schema';
import { type ProductInventoryItem } from '@/types/product';
import { Trash2 } from 'lucide-react';
import { type ComponentProps } from 'react';
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
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
