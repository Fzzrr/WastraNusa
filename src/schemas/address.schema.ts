import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label alamat wajib diisi'),
  recipientName: z.string().min(1, 'Nama penerima wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  city: z.string().min(1, 'Kota/Kabupaten wajib diisi'),
  district: z.string().min(1, 'Kecamatan wajib diisi'),
  subdistrict: z.string().nullish(),
  postalCode: z.string().min(1, 'Kode pos wajib diisi'),
  fullAddress: z.string().min(1, 'Alamat lengkap wajib diisi'),
  notes: z.string().nullish(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
