import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import type {
  ProductCatalogFilters,
  ProductCatalogSortBy,
} from '@/types/product';

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
    inStock,
    excludeOutOfStock,
    topic,
    q,
  } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];

  if (q) {
    const contains = { contains: q, mode: 'insensitive' as const };
    andConditions.push({
      OR: [
        { name: contains },
        { description: contains },
        { clothingType: contains },
        { island: contains },
        { province: contains },
        { article: { title: contains } },
      ],
    });
  }

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
    // The public catalog (and every count shown with it) only covers products
    // that are actually for sale: active, with a seller to fulfil the order.
    status: 'active',
    sellerId: { not: null },
    ...(island ? { island } : {}),
    ...(clothingType ? { clothingType } : {}),
    ...(gender ? { gender } : {}),
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
  async findChatProducts(article: {
    id: string;
    topic: string;
    motifLabel: string;
    province: string | null;
    clothingType: string | null;
  }) {
    const available: Prisma.ProductWhereInput = {
      status: 'active',
      sellerId: { not: null },
      variants: { some: { stock: { gt: 0 } } },
      article: { status: 'published' },
    };
    const select = {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageURL: true,
      price: true,
      status: true,
      clothingType: true,
      gender: true,
      province: true,
      island: true,
      article: { select: { id: true, title: true } },
      variants: {
        where: { stock: { gt: 0 } },
        select: { id: true, type: true, name: true, price: true, stock: true },
        orderBy: { createdAt: 'asc' as const },
      },
    } satisfies Prisma.ProductSelect;
    // Fetch exact matches independently so newer related rows cannot hide them.
    const exact = prisma.product.findMany({
      where: { AND: [available, { articleId: article.id }] },
      take: 12,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      select,
    });
    const closeMatches: Prisma.ArticleWhereInput[] = [];
    if (article.motifLabel?.trim()) {
      closeMatches.push({
        motifLabel: { equals: article.motifLabel, mode: 'insensitive' },
      });
    }
    if (article.province && article.clothingType) {
      closeMatches.push({
        province: article.province,
        clothingType: article.clothingType,
      });
    }
    if (!closeMatches.length) return exact;
    const related = prisma.product.findMany({
      where: {
        AND: [
          available,
          { articleId: { not: article.id } },
          {
            article: { topic: article.topic, OR: closeMatches },
          },
        ],
      },
      take: 12,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      select,
    });
    const [exactProducts, relatedProducts] = await Promise.all([
      exact,
      related,
    ]);
    return [...exactProducts, ...relatedProducts];
  },

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
        seller: {
          select: {
            id: true,
            name: true,
            shopProfile: {
              select: {
                shopName: true,
              },
            },
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

  /** A seller's products as the public sees them: for sale and in stock. */
  findActiveBySeller: async (sellerId: string) => {
    return prisma.product.findMany({
      where: {
        sellerId,
        status: 'active',
        variants: { some: { stock: { gt: 0 } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
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
