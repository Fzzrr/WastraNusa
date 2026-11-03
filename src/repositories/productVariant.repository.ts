import prisma from '@/lib/prisma';

export const productVariantRepository = {
  findVariantById: async (variantId: string) => {
    return prisma.productVariant.findUnique({
      where: { id: variantId },
    });
  },

  incrementVariantStock: async (variantId: string, quantity: number) => {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    });
  },
};
