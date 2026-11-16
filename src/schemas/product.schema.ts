import { Gender, VariantType } from '@/generated/prisma/enums';
import { z } from 'zod';

// Forms send '' for an empty optional URL field; store that as null.
const optionalUrl = z
  .union([
    // http(s) only: `z.url()` alone also accepts `javascript:` and `data:`.
    z.url({ protocol: /^https?$/, error: 'Format URL tidak valid' }),
    z.literal('').transform(() => null),
  ])
  .nullish();

// Midtrans only takes whole rupiah amounts.
const MAX_PRICE = 1_000_000_000;
const priceSchema = z
  .number()
  .int('Harga harus bilangan bulat (tanpa desimal)')
  .min(1, 'Harga minimal Rp1')
  .max(MAX_PRICE, 'Harga maksimal Rp1.000.000.000');
const requiredVariantPriceSchema = z
  .number({
    error: (issue) =>
      issue.input === undefined || Number.isNaN(issue.input)
        ? 'Harga varian wajib diisi'
        : 'Harga varian harus berupa angka',
  })
  .int('Harga varian harus bilangan bulat (tanpa desimal)')
  .min(1, 'Harga varian minimal Rp1')
  .max(MAX_PRICE, 'Harga varian maksimal Rp1.000.000.000');

const productVariantInputSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'Nama varian wajib diisi'),
    type: z.nativeEnum(VariantType),
    price: requiredVariantPriceSchema,
    stock: z
      .number()
      .int()
      .min(0, 'Stok varian tidak boleh negatif')
      .max(100_000, 'Stok varian maksimal 100.000'),
    sku: z.string().min(1, 'SKU varian wajib diisi'),
    imageURL: optionalUrl,
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
  price: priceSchema,
  sku: z.string().min(1, 'SKU produk wajib diisi'),
  weight: z
    .number()
    .int()
    .min(1, 'Berat produk wajib diisi dalam gram dan minimal 1'),
  clothingType: z.string().min(1, 'Jenis pakaian wajib diisi'),
  gender: z.nativeEnum(Gender).nullish(),
  imageURL: optionalUrl,
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

/** Seller turns a product on or off in the public catalog. */
export const productStatusSchema = z
  .object({ status: z.enum(['active', 'inactive']) })
  .strict();
