import type { VariantType } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

export type VariantWrite = {
  id: string;
  name: string;
  type: VariantType;
  price?: number | null;
  stock: number;
  sku: string;
  imageURL?: string | null;
};

const productInclude = {
  article: {
    select: {
      id: true,
      title: true,
    },
  },
  variants: {
    orderBy: {
      createdAt: 'asc',
    },
  },
} as const;

/**
 * Seller-scoped product data access. Every read is filtered by `sellerId` and
 * every write is resolved through an owned product id, so a seller can never
 * reach another seller's inventory.
 */
export const sellerProductRepository = {
  findAllBySeller: async ({
    sellerId,
    offset,
    limit,
  }: {
    sellerId: string;
    offset?: number;
    limit?: number;
  }) => {
    return prisma.product.findMany({
      where: { sellerId },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    });
  },

  countBySeller: async (sellerId: string) => {
    return prisma.product.count({ where: { sellerId } });
  },

  /** Resolve an owned product id from an id-or-slug scoped to the seller. */
  resolveOwnedProductId: async (sellerId: string, idOrSlug: string) => {
    const product = await prisma.product.findFirst({
      where: {
        sellerId,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: { id: true },
    });

    return product?.id ?? null;
  },

  findByIdOrSlugForSeller: async (sellerId: string, idOrSlug: string) => {
    return prisma.product.findFirst({
      where: {
        sellerId,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: productInclude,
    });
  },

  create: async (data: Record<string, unknown>) => {
    return prisma.product.create({
      data: data as never,
      include: {
        article: { select: { id: true, title: true } },
        variants: true,
      },
    });
  },

  /**
   * Updates a product and syncs its variants in one transaction. Kept variants
   * are updated in place so carts and orders that point at them stay linked;
   * only variants missing from `variants.kept` are deleted.
   */
  update: async (
    productId: string,
    data: Record<string, unknown>,
    variants?: { kept: VariantWrite[]; created: VariantWrite[] },
  ) => {
    return prisma.$transaction(async (tx) => {
      if (variants) {
        await tx.productVariant.deleteMany({
          where: {
            productId,
            id: { notIn: variants.kept.map((variant) => variant.id) },
          },
        });
        // SKUs are unique and the form renumbers them (-V1, -V2…), so park
        // kept variants on a temporary SKU first; otherwise reordering or
        // removing a variant collides on the unique index mid-update.
        for (const variant of variants.kept) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { sku: `tmp-${variant.id}` },
          });
        }
        for (const { id, ...rest } of variants.kept) {
          await tx.productVariant.update({ where: { id }, data: rest });
        }
        if (variants.created.length > 0) {
          await tx.productVariant.createMany({
            data: variants.created.map((variant) => ({
              ...variant,
              productId,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id: productId },
        data: data as never,
        include: productInclude,
      });
    });
  },

  /** Names of the given variants that sit in an order still awaiting payment. */
  findVariantsInUnpaidOrders: async (variantIds: string[]) => {
    if (variantIds.length === 0) return [];
    return prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        orderItems: {
          some: { order: { orderStatus: 'pending', paymentStatus: 'unpaid' } },
        },
      },
      select: { name: true },
    });
  },

  delete: async (productId: string) => {
    return prisma.product.delete({
      where: { id: productId },
    });
  },
};
