import type { PaymentTransactionStatus } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export const paymentTransactionRepository = {
  setPaymentUrl: async (externalId: string, paymentUrl: string) => {
    return prisma.paymentTransaction.update({
      where: { externalId },
      data: { paymentUrl },
    });
  },

  updatePaymentStatus: async (
    externalId: string,
    data: {
      status: PaymentTransactionStatus;
      paidAt?: Date | null;
      expiredAt?: Date | null;
    },
  ) => {
    return prisma.paymentTransaction.update({
      where: { externalId },
      data,
    });
  },

  findTransactionByExternalId: async (externalId: string) => {
    return prisma.paymentTransaction.findUnique({
      where: { externalId },
    });
  },
};
