import { OrderStatus } from '@/generated/prisma/enums';
import { z } from 'zod';

const editableOrderStatusSchema = z.union([
  z.literal(OrderStatus.processing),
  z.literal(OrderStatus.shipped),
  z.literal(OrderStatus.delivered),
]);

export const adminOrderUpdateSchema = z
  .object({
    orderStatus: editableOrderStatusSchema.optional(),
    trackingNumber: z.string().max(100).nullish(),
  })
  .strict()
  .refine(
    (value) =>
      value.orderStatus !== undefined || value.trackingNumber !== undefined,
    {
      message: 'Setidaknya satu field harus diubah',
      path: ['orderStatus'],
    },
  );

export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;
