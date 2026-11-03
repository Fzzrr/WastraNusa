import { z } from 'zod';

/**
 * Validation restrictions for a seller editing their own shop profile. The
 * length bounds mirror the `@db.VarChar` columns on the `ShopProfile` model so
 * the API and the database agree. Optional fields accept an empty string (the
 * form clears to `''`) and only enforce their format when a value is present;
 * the service normalizes blanks to `null` before persisting.
 */

const PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;

/** Optional free-text: trimmed, length-capped, empty allowed. */
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter`).optional();

export const updateShopProfileSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(3, 'Nama toko minimal 3 karakter')
    .max(60, 'Nama toko maksimal 60 karakter'),
  description: optionalText(500, 'Deskripsi toko'),
  phoneNumber: z
    .string()
    .trim()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .refine(
      (value) => value === '' || PHONE_REGEX.test(value),
      'Format nomor telepon tidak valid',
    )
    .optional(),
  email: z
    .string()
    .trim()
    .max(120, 'Email maksimal 120 karakter')
    .refine(
      (value) => value === '' || EMAIL_REGEX.test(value),
      'Format email tidak valid',
    )
    .optional(),
  address: optionalText(255, 'Alamat'),
  city: optionalText(60, 'Kota'),
  province: optionalText(60, 'Provinsi'),
  logoURL: z
    .string()
    .trim()
    .max(2048, 'URL terlalu panjang')
    .refine(
      (value) => value === '' || URL_REGEX.test(value),
      'Format URL tidak valid',
    )
    .optional(),
});

export type UpdateShopProfileInput = z.infer<typeof updateShopProfileSchema>;
