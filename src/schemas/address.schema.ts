import { z } from 'zod';

import { PHONE_REGEX } from './shop-profile.schema';

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label alamat wajib diisi'),
  recipientName: z.string().min(1, 'Nama penerima wajib diisi'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .transform((value) => value.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(PHONE_REGEX, 'Format nomor telepon tidak valid')),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  city: z.string().min(1, 'Kota/Kabupaten wajib diisi'),
  district: z.string().min(1, 'Kecamatan wajib diisi'),
  subdistrict: z.string().nullish(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit angka'),
  fullAddress: z.string().min(1, 'Alamat lengkap wajib diisi'),
  notes: z.string().nullish(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
