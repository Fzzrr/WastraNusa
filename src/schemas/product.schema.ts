import { Gender, VariantType } from '@/generated/prisma/enums';
import { z } from 'zod';

const decimalNumberSchema = z.number().min(0, 'Nilai tidak boleh negatif');
const requiredVariantPriceSchema = z
  .number({
    error: (issue) =>
      issue.input === undefined || Number.isNaN(issue.input)
        ? 'Harga varian wajib diisi'
        : 'Harga varian harus berupa angka',
  })
  .min(0, 'Harga varian tidak boleh negatif');

const productVariantInputSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'Nama varian wajib diisi'),
    type: z.nativeEnum(VariantType),
    price: requiredVariantPriceSchema,
    stock: z.number().int().min(0, 'Stok varian tidak boleh negatif'),
    sku: z.string().min(1, 'SKU varian wajib diisi'),
    imageURL: z.string().url('Format URL tidak valid').nullish(),
  })
  .strict();

const requiredVariantsSchema = z
  .array(productVariantInputSchema)
  .min(1, 'Minimal harus ada 1 varian produk');

const productPayloadSchema = z.object({
  articleId: z.string().min(1, 'Artikel wajib dipilih'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  slug: z.string().min(1, 'Slug produk wajib diisi'),
  description: z.string().nullish(),
  price: decimalNumberSchema,
  sku: z.string().min(1, 'SKU produk wajib diisi'),
  weight: z
    .number()
    .int()
    .min(1, 'Berat produk wajib diisi dalam gram dan minimal 1'),
  clothingType: z.string().min(1, 'Jenis pakaian wajib diisi'),
  gender: z.nativeEnum(Gender).nullish(),
  imageURL: z.url('Format URL tidak valid').nullish(),
  variants: requiredVariantsSchema,
});

export const createProductSchema = productPayloadSchema.strict();

export const updateProductSchema = productPayloadSchema
  .partial()
  .extend({
    slug: z.string().min(1, 'Slug produk wajib diisi'),
    variants: requiredVariantsSchema,
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
