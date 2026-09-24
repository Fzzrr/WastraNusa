import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import type {
  ProductCatalogFilters,
  ProductCatalogSortBy,
} from '@/types/product';

async function resolveProductId(idOrSlug: string) {
  const foundProduct = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: {
      id: true,
    },
  });

  return foundProduct?.id ?? null;
}

const DEFAULT_SORT: ProductCatalogSortBy = 'newest';

function buildProductWhereInput(
  filters: ProductCatalogFilters = {},
): Prisma.ProductWhereInput {
  const {
    minPrice,
    maxPrice,
    island,
    size,
    clothingType,
    gender,
    status,
    inStock,
    excludeOutOfStock,
    topic,
  } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];

  if (size) {
    andConditions.push({
      variants: {
        some: {
          type: 'size',
          name: size,
        },
      },
    });
  }

  if (typeof inStock === 'boolean') {
    andConditions.push(
      inStock
        ? {
            variants: {
              some: {
                stock: { gt: 0 },
              },
            },
          }
        : {
            variants: {
              none: {
                stock: { gt: 0 },
              },
            },
          },
    );
  }

  if (topic) {
    andConditions.push({
      article: {
        topic,
      },
    });
  }

  if (excludeOutOfStock) {
    andConditions.push({
      variants: {
        some: {
          stock: { gt: 0 },
        },
      },
    });
  }

  const where: Prisma.ProductWhereInput = {
    ...(island ? { island } : {}),
    ...(clothingType ? { clothingType } : {}),
    ...(gender ? { gender } : {}),
    ...(status ? { status } : {}),
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  };

  if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
    where.price = {
      ...(typeof minPrice === 'number' ? { gte: minPrice } : {}),
      ...(typeof maxPrice === 'number' ? { lte: maxPrice } : {}),
    };
  }

  return where;
}

function buildOrderBy(sortBy: ProductCatalogSortBy = DEFAULT_SORT) {
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 'asc' } as const;
    case 'price_asc':
      return { price: 'asc' } as const;
    case 'price_desc':
      return { price: 'desc' } as const;
    case 'name_asc':
      return { name: 'asc' } as const;
    case 'name_desc':
      return { name: 'desc' } as const;
    case 'newest':
    default:
      return { createdAt: 'desc' } as const;
  }
}

export const productRepository = {
  findProductById: async (productId: string) => {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  },

  findAll: async ({
    offset,
    limit,
    filters,
  }: {
    offset?: number;
    limit?: number;
    filters?: ProductCatalogFilters;
  } = {}) => {
    const orderBy = buildOrderBy(filters?.sortBy);
    const where = buildProductWhereInput(filters);

    return prisma.product.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
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
      },
    });
  },

  countAll: async (filters?: ProductCatalogFilters) => {
    return prisma.product.count({
      where: buildProductWhereInput(filters),
    });
  },

  countByClothingType: async (filters?: ProductCatalogFilters) => {
    return prisma.product.groupBy({
      by: ['clothingType'],
      where: buildProductWhereInput(filters),
      _count: {
        clothingType: true,
      },
      orderBy: {
        clothingType: 'asc',
      },
    });
  },

  countByIsland: async (filters?: ProductCatalogFilters) => {
    return prisma.product.groupBy({
      by: ['island'],
      where: buildProductWhereInput(filters),
      _count: {
        island: true,
      },
      orderBy: {
        island: 'asc',
      },
    });
  },

  countBySize: async (filters?: ProductCatalogFilters) => {
    return prisma.productVariant.groupBy({
      by: ['name'],
      where: {
        type: 'size',
        product: buildProductWhereInput(filters),
      },
      _count: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  countByGender: async (filters?: ProductCatalogFilters) => {
    return prisma.product.groupBy({
      by: ['gender'],
      where: buildProductWhereInput(filters),
      _count: {
        gender: true,
      },
      orderBy: {
        gender: 'asc',
      },
    });
  },

  countByStatus: async (filters?: ProductCatalogFilters) => {
    return prisma.product.groupBy({
      by: ['status'],
      where: buildProductWhereInput(filters),
      _count: {
        status: true,
      },
      orderBy: {
        status: 'asc',
      },
    });
  },

  countCreatedSince: async (since: Date) => {
    return prisma.product.count({
      where: {
        createdAt: {
          gte: since,
        },
      },
    });
  },

  countLowStock: async (threshold: number = 5) => {
    const products = await prisma.product.findMany({
      select: {
        status: true,
        variants: {
          select: {
            stock: true,
          },
        },
      },
    });

    return products.filter((product) => {
      const totalStock = product.variants.reduce(
        (total, variant) => total + variant.stock,
        0,
      );

      return product.status === 'out_of_stock' || totalStock <= threshold;
    }).length;
  },

  countOutOfStock: async () => {
    const products = await prisma.product.findMany({
      select: {
        status: true,
        variants: {
          select: {
            stock: true,
          },
        },
      },
    });

    return products.filter((product) => {
      const totalStock = product.variants.reduce(
        (total, variant) => total + variant.stock,
        0,
      );

      return product.status === 'out_of_stock' || totalStock === 0;
    }).length;
  },

  findLowStock: async (threshold: number = 5, limit: number = 6) => {
    const products = await prisma.product.findMany({
      select: {
        name: true,
        clothingType: true,
        status: true,
        updatedAt: true,
        variants: {
          select: {
            stock: true,
          },
        },
      },
    });

    return products
      .map((product) => ({
        name: product.name,
        clothingType: product.clothingType,
        stock: product.variants.reduce(
          (total, variant) => total + variant.stock,
          0,
        ),
        status: product.status,
        updatedAt: product.updatedAt,
      }))
      .filter(
        (product) =>
          product.status === 'out_of_stock' || product.stock <= threshold,
      )
      .sort((left, right) => {
        if (left.stock !== right.stock) {
          return left.stock - right.stock;
        }

        return right.updatedAt.getTime() - left.updatedAt.getTime();
      })
      .slice(0, limit)
      .map(({ ...product }) => product);
  },

  getPriceRange: async (filters?: ProductCatalogFilters) => {
    const aggregate = await prisma.product.aggregate({
      where: buildProductWhereInput(filters),
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return {
      min: aggregate._min.price?.toNumber() ?? 0,
      max: aggregate._max.price?.toNumber() ?? 0,
    };
  },

  findByIdOrSlug: async (idOrSlug: string) => {
    return prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
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
      },
    });
  },

  create: async (data: Record<string, unknown>) => {
    return prisma.product.create({
      data: data as never,
      include: {
        article: {
          select: {
            id: true,
            title: true,
          },
        },
        variants: true,
      },
    });
  },

  update: async (idOrSlug: string, data: Record<string, unknown>) => {
    const productId = await resolveProductId(idOrSlug);

    return prisma.product.update({
      where: {
        id: productId ?? idOrSlug,
      },
      data: data as never,
      include: {
        article: {
          select: {
            id: true,
            title: true,
          },
        },
        variants: true,
      },
    });
  },

  delete: async (idOrSlug: string) => {
    const productId = await resolveProductId(idOrSlug);

    return prisma.product.delete({
      where: {
        id: productId ?? idOrSlug,
      },
    });
  },

  getDistinctClothingTypes: async () => {
    const result = await prisma.product.findMany({
      distinct: ['clothingType'],
      select: {
        clothingType: true,
      },
      orderBy: {
        clothingType: 'asc',
      },
    });

    return result
      .map((item) => item.clothingType)
      .filter((type): type is string => type !== null);
  },
};
