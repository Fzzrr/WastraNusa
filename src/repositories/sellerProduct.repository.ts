import prisma from '@/lib/prisma';

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

  update: async (productId: string, data: Record<string, unknown>) => {
    return prisma.product.update({
      where: { id: productId },
      data: data as never,
      include: {
        article: { select: { id: true, title: true } },
        variants: true,
      },
    });
  },

  delete: async (productId: string) => {
    return prisma.product.delete({
      where: { id: productId },
    });
  },
};
