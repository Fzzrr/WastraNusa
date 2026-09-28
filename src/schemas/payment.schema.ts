import { z } from 'zod';

const checkoutItemSchema = z.object({
  cartItemId: z.string().min(1).optional(),
  productId: z.string().min(1, 'ID produk wajib diisi'),
  variantId: z.string().nullish(),
  quantity: z.number().int().min(1, 'Jumlah minimal 1'),
  frontendPrice: z.number().min(0).optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(checkoutItemSchema)
    .min(1, 'Minimal satu produk wajib dipilih'),
  shippingAddressId: z
    .string()
    .min(1, 'Alamat pengiriman wajib dipilih')
    .nullish(),
  courier: z.string().min(1, 'Kurir wajib dipilih'),
  courierService: z.string().min(1, 'Layanan kurir wajib dipilih'),
  estimatedDelivery: z.string().nullish(),
  shippingCost: z.number().min(0, 'Ongkos kirim tidak boleh negatif'),
  customerNotes: z.string().nullish(),
});

/**
 * Schema for POST /api/webhooks/midtrans - Midtrans notification payload.
 * @see https://docs.midtrans.com/docs/https-notification-webhooks
 */
export const midtransNotificationSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string(),
  gross_amount: z.string(),
  status_code: z.string(),
  transaction_status: z.string(),
  signature_key: z.string(),
  payment_type: z.string(),
  fraud_status: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type MidtransNotificationInput = z.infer<
  typeof midtransNotificationSchema
>;
