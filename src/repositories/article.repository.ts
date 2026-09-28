import { ArticleStatus, Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { mergeUniqueSorted } from '@/lib/utils';

const getUniqueWhere = (idOrSlug: string) => {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug,
    );
  return isUuid ? { id: idOrSlug } : { slug: idOrSlug };
};

export const articleRepository = {
  findAll: async ({
    offset,
    limit,
    island,
    topic,
  }: {
    offset?: number;
    limit?: number;
    island?: string;
    topic?: string;
  } = {}) => {
    const where: Prisma.ArticleWhereInput = {
      ...(island ? { island } : {}),
      ...(topic ? { topic } : {}),
    };

    return prisma.article.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        engagement: true,
      },
    });
  },

  countAll: async ({
    island,
    topic,
    status,
  }: { island?: string; topic?: string; status?: ArticleStatus } = {}) => {
    const where: Prisma.ArticleWhereInput = {
      ...(island ? { island } : {}),
      ...(topic ? { topic } : {}),
      ...(status ? { status } : {}),
    };

    return prisma.article.count({ where });
  },

  countByIsland: async ({ topic }: { topic?: string } = {}) => {
    return prisma.article.groupBy({
      by: ['island'],
      where: {
        status: 'published',
        ...(topic ? { topic } : {}),
      },
      _count: {
        island: true,
      },
      orderBy: {
        island: 'asc',
      },
    });
  },

  countByTopic: async ({ island }: { island?: string } = {}) => {
    return prisma.article.groupBy({
      by: ['topic'],
      where: {
        status: 'published',
        ...(island ? { island } : {}),
      },
      _count: {
        topic: true,
      },
      orderBy: {
        topic: 'asc',
      },
    });
  },

  countDistinctMotifLabel: async () => {
    const motifGroups = await prisma.article.groupBy({
      by: ['motifLabel'],
      where: {
        status: 'published',
      },
      _count: {
        motifLabel: true,
      },
    });

    return motifGroups.filter((item) => item.motifLabel.trim().length > 0)
      .length;
  },

  countDistinctProvince: async () => {
    const provinceGroups = await prisma.article.groupBy({
      by: ['province'],
      where: {
        status: 'published',
        province: {
          not: null,
        },
      },
      _count: {
        province: true,
      },
    });

    return provinceGroups.filter(
      (item) => item.province && item.province.trim().length > 0,
    ).length;
  },

  findMostPopular: async (limit: number = 6) => {
    return prisma.articleEngagement.findMany({
      take: limit,
      orderBy: [{ viewCount: 'desc' }, { updatedAt: 'desc' }],
      include: {
        article: {
          select: {
            slug: true,
            title: true,
            topic: true,
            region: true,
            readMinutes: true,
          },
        },
      },
    });
  },

  findByIdOrSlug: async (idOrSlug: string) => {
    return prisma.article.findUnique({
      where: getUniqueWhere(idOrSlug),
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        engagement: true,
        products: {
          select: {
            slug: true,
            name: true,
            province: true,
            island: true,
            price: true,
            imageURL: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });
  },

  create: async (data: Prisma.ArticleUncheckedCreateInput) => {
    return prisma.article.create({
      data: {
        ...data,
        engagement: {
          create: {
            id: `eng_${data.id}`,
            viewCount: 0,
            likeCount: 0,
          },
        },
      },
    });
  },

  update: async (idOrSlug: string, data: Prisma.ArticleUpdateInput) => {
    return prisma.article.update({
      where: getUniqueWhere(idOrSlug),
      data,
    });
  },

  delete: async (idOrSlug: string) => {
    return prisma.article.delete({
      where: getUniqueWhere(idOrSlug),
    });
  },

  incrementViewCount: async (idOrSlug: string) => {
    return prisma.article.update({
      where: getUniqueWhere(idOrSlug),
      data: {
        engagement: {
          update: { viewCount: { increment: 1 } },
        },
      },
    });
  },

  findUserLike: async (articleId: string, userId: string) => {
    return prisma.userArticleLike.findFirst({
      where: { articleId, userId },
    });
  },

  countLikedByUser: async (userId: string) => {
    return prisma.userArticleLike.count({
      where: {
        userId,
        article: {
          is: {
            status: 'published',
          },
        },
      },
    });
  },

  countCreatedSince: async (since: Date) => {
    return prisma.article.count({
      where: {
        createdAt: {
          gte: since,
        },
      },
    });
  },

  findLikedByUser: async ({
    userId,
    offset,
    limit,
  }: {
    userId: string;
    offset?: number;
    limit?: number;
  }) => {
    return prisma.userArticleLike.findMany({
      where: {
        userId,
        article: {
          is: {
            status: 'published',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
      include: {
        article: {
          include: {
            engagement: true,
          },
        },
      },
    });
  },

  toggleLike: async (idOrSlug: string, userId: string) => {
    return prisma.$transaction(async (tx) => {
      const article = await tx.article.findUnique({
        where: getUniqueWhere(idOrSlug),
        select: { id: true },
      });

      if (!article) {
        throw new Error('NotFound');
      }

      const existingLike = await tx.userArticleLike.findFirst({
        where: { articleId: article.id, userId },
      });

      if (existingLike) {
        // Unlike
        await tx.userArticleLike.delete({
          where: { id: existingLike.id },
        });
        const engagement = await tx.articleEngagement.update({
          where: { articleId: article.id },
          data: { likeCount: { decrement: 1 } },
        });
        return { isLiked: false, engagement };
      } else {
        // Like
        await tx.userArticleLike.create({
          data: {
            id: crypto.randomUUID(),
            articleId: article.id,
            userId,
          },
        });
        const engagement = await tx.articleEngagement.update({
          where: { articleId: article.id },
          data: { likeCount: { increment: 1 } },
        });
        return { isLiked: true, engagement };
      }
    });
  },

  /**
   * Every distinct value already used for the free-text classification
   * fields, so the article form can offer them for reuse.
   */
  getFieldOptions: async () => {
    // ponytail: one scan of all articles, deduped in memory; fine for an
    // editorial catalog of hundreds, switch to per-field `distinct` if it grows.
    const rows = await prisma.article.findMany({
      select: {
        motifLabel: true,
        topic: true,
        ethnicGroup: true,
        clothingType: true,
      },
    });

    const unique = (values: Array<string | null>) =>
      mergeUniqueSorted(values.filter((value): value is string => !!value));

    return {
      motifLabels: unique(rows.map((row) => row.motifLabel)),
      topics: unique(rows.map((row) => row.topic)),
      ethnicGroups: unique(rows.map((row) => row.ethnicGroup)),
      clothingTypes: unique(rows.map((row) => row.clothingType)),
    };
  },

  getDistinctTopics: async () => {
    const result = await prisma.article.findMany({
      distinct: ['topic'],
      select: {
        topic: true,
      },
      where: {
        status: 'published',
      },
      orderBy: {
        topic: 'asc',
      },
      take: 7,
    });

    return result
      .map((item) => item.topic)
      .filter((topic): topic is string => topic !== null && topic.length > 0);
  },
};
