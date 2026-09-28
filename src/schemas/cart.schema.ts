import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'ID produk wajib diisi'),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive('Jumlah harus berupa angka positif'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Jumlah harus berupa angka positif'),
});

export const removeFromCartSchema = z.object({
  cartItemIds: z.array(z.string()).min(1, 'Minimal satu item wajib dipilih'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
