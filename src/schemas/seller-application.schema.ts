import { z } from 'zod';

/**
 * Payload a user submits to apply for a seller account.
 */
export const createSellerApplicationSchema = z.object({
  shopName: z.string().min(1, 'Nama toko wajib diisi'),
  description: z.string().nullish(),
  phoneNumber: z.string().nullish(),
});

export const updateSellerApplicationSchema =
  createSellerApplicationSchema.partial();

/**
 * Admin decision on a pending application. A rejection must carry a reason.
 */
export const reviewSellerApplicationSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().nullish(),
  })
  .refine(
    (data) =>
      data.status !== 'rejected' ||
      (typeof data.rejectionReason === 'string' &&
        data.rejectionReason.trim().length > 0),
    {
      message: 'Alasan penolakan wajib diisi',
      path: ['rejectionReason'],
    },
  );

export type CreateSellerApplicationInput = z.infer<
  typeof createSellerApplicationSchema
>;
export type UpdateSellerApplicationInput = z.infer<
  typeof updateSellerApplicationSchema
>;
export type ReviewSellerApplicationInput = z.infer<
  typeof reviewSellerApplicationSchema
>;

/**
 * Admin revokes a seller's status (back to a regular user). Must carry a reason.
 */
export const demoteSellerSchema = z.object({
  reason: z.string().trim().min(1, 'Alasan wajib diisi'),
});

export type DemoteSellerInput = z.infer<typeof demoteSellerSchema>;
