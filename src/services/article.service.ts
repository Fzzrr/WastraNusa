import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { formatIDR } from '@/lib/utils';
import { articleRepository } from '@/repositories/article.repository';
import {
  type CreateArticleInput,
  type UpdateArticleInput,
} from '@/schemas/article.schema';
import { type ArticleDashboardData } from '@/types/dashboard';
import {
  type EncyclopediaArticleFilters,
  type EncyclopediaArticleListResponse,
  type IslandFilter,
} from '@/types/encyclopedia';
import type { LikedArticlesResponse } from '@/types/profile';

const formatCount = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

export const articleService = {
  getArticles: async (
    page: number = 1,
    limit: number = 10,
    filters: EncyclopediaArticleFilters = {},
  ): Promise<EncyclopediaArticleListResponse> => {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const offset = (Math.max(1, page) - 1) * safeLimit;
    const island = filters.island || undefined;
    const topic = filters.topic || undefined;

    const [
      articles,
      totalItems,
      globalTotalItems,
      totalItemsByTopic,
      islandCounts,
      topicCounts,
      totalWastraTypes,
      totalProvinces,
    ] = await Promise.all([
      articleRepository.findAll({
        offset,
        limit: safeLimit,
        island,
        topic,
      }),
      articleRepository.countAll({ island, topic }),
      articleRepository.countAll({ status: 'published' }),
      articleRepository.countAll({ topic, status: 'published' }),
      articleRepository.countByIsland({ topic }),
      articleRepository.countByTopic({ island }),
      articleRepository.countDistinctMotifLabel(),
      articleRepository.countDistinctProvince(),
    ]);

    const items = articles.map((article) => ({
      ...article,
      region: article.region,
      topic: article.topic,
      motifLabel: article.motifLabel,
      title: article.title,
      excerpt: article.excerpt,
      likes: article.engagement?.likeCount || 0,
      views: formatCount(article.engagement?.viewCount || 0),
      readMinutes: article.readMinutes,
      featured: article.featured,
    }));

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const islands: IslandFilter[] = [
      { name: 'Semua Pulau', count: totalItemsByTopic, active: !island },
      ...islandCounts
        .filter((islandCount) => islandCount.island !== null)
        .map((islandCount) => ({
          name: islandCount.island as string,
          count: islandCount._count.island,
          active: islandCount.island === island,
        })),
    ];
    const topics = topicCounts
      .map((topicCount) => topicCount.topic.trim())
      .filter((topicName) => topicName.length > 0);

    return {
      items,
      meta: {
        page: Math.max(1, page),
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: Math.max(1, page) < totalPages,
        islands,
        topics,
        stats: {
          totalArticles: globalTotalItems,
          totalIslands: islandCounts.length,
          totalWastraTypes,
          totalProvinces,
        },
      },
    };
  },

  getDashboardOverview: async (): Promise<ArticleDashboardData> => {
    const [totalArticles, mostPopularArticles] = await Promise.all([
      articleRepository.countAll({ status: 'published' }),
      articleRepository.findMostPopular(6),
    ]);

    // compute weekly and monthly deltas (new items)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyDelta, monthlyDelta] = await Promise.all([
      articleRepository.countCreatedSince(weekAgo),
      articleRepository.countCreatedSince(monthAgo),
    ]);

    return {
      totalArticles,
      weeklyDelta,
      monthlyDelta,
      popularArticles: mostPopularArticles.map((item, index) => ({
        rank: index + 1,
        slug: item.article.slug,
        title: item.article.title,
        category: item.article.topic,
        region: item.article.region,
        views: item.viewCount,
        readTimeMinutes: item.article.readMinutes,
      })),
    };
  },

  getArticleDetail: async (idOrSlug: string, userId?: string) => {
    const article = await articleRepository.findByIdOrSlug(idOrSlug);
    if (!article) {
      throw new ApiError('Article not found', 404);
    }

    const existingLike =
      userId && article.id
        ? await articleRepository.findUserLike(article.id, userId)
        : null;

    // NOTE: Consider creating a dedicated endpoint for incrementing view counts instead of mixing it with getArticleDetail.
    articleRepository.incrementViewCount(idOrSlug).catch((error) => {
      logger.error(`Failed to increment view count for article ${idOrSlug}`, {
        error,
      });
    });

    return {
      ...article,
      gender: article.gender,
      author: article.creator?.name || 'Admin',
      publishedAt: article.createdAt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      tags: [article.motifLabel, article.region, article.topic].filter(Boolean),
      quote: `${article.motifLabel} merepresentasikan warisan budaya yang hidup melalui teknik, simbol, dan praktik sosial masyarakat Indonesia.`,
      intro: article.summary || article.excerpt || article.description || '',
      sections:
        article.sections?.map((section) => ({
          title: section.title,
          content: section.content,
          imageLabel: section.imageLabel ?? undefined,
          imageCaption: section.imageCaption ?? undefined,
          imageURL: section.imageURL ?? undefined,
        })) || [],
      keyFacts: [
        { label: 'Wilayah Utama', value: article.region },
        { label: 'Kategori', value: article.topic },
        { label: 'Jenis Wastra', value: article.motifLabel },
        { label: 'Durasi Baca', value: `${article.readMinutes} menit` },
      ],
      relatedProducts: (article.products ?? []).map((product) => ({
        slug: product.slug,
        name: product.name,
        location: [product.province, product.island].filter(Boolean).join(', '),
        price: formatIDR(Number(product.price)),
        ...(product.imageURL ? { imageURL: product.imageURL } : {}),
      })),
      discussionCount: 0,
      nextArticle: {
        slug: '',
        title: 'Kembali ke Artikel Populer',
      },
      references: ['[1] Wikipedia'],
      // Base compatibility
      region: article.region,
      topic: article.topic,
      motifLabel: article.motifLabel,
      title: article.title,
      excerpt: article.excerpt,
      likes: article.engagement?.likeCount || 0,
      isLiked: Boolean(existingLike),
      views: formatCount(article.engagement?.viewCount || 0),
      readMinutes: article.readMinutes,
      featured: article.featured,
    };
  },

  getLikedArticles: async (
    userId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<LikedArticlesResponse> => {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const totalItems = await articleRepository.countLikedByUser(userId);
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * safeLimit;
    const likedArticles = await articleRepository.findLikedByUser({
      userId,
      offset,
      limit: safeLimit,
    });

    return {
      items: likedArticles.map(({ article }) => ({
        id: article.id,
        slug: article.slug,
        region: article.region,
        topic: article.topic,
        motifLabel: article.motifLabel,
        title: article.title,
        excerpt: article.excerpt,
        likes: article.engagement?.likeCount || 0,
        views: formatCount(article.engagement?.viewCount || 0),
        readMinutes: article.readMinutes,
        featured: article.featured,
        status: article.status,
        imageUrl: article.imageURL,
      })),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
      },
    };
  },

  createArticle: async (data: CreateArticleInput, userId: string) => {
    const id = crypto.randomUUID();
    const slug =
      data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { sections, ...restData } = data;

    const article = await articleRepository.create({
      ...restData,
      id,
      slug,
      createdBy: userId,
      sections: sections ? { create: sections } : undefined,
    });
    logger.info('Article created successfully', { articleId: id, slug });
    return article;
  },

  updateArticle: async (idOrSlug: string, data: UpdateArticleInput) => {
    const { sections, ...restData } = data;
    const article = await articleRepository.update(idOrSlug, {
      ...restData,
      sections: sections
        ? {
            deleteMany: {},
            create: sections,
          }
        : undefined,
    });
    logger.info('Article updated successfully', { articleId: idOrSlug });
    return article;
  },

  deleteArticle: async (idOrSlug: string) => {
    const article = await articleRepository.delete(idOrSlug);
    logger.info('Article deleted successfully', { articleId: article.id });
    return article;
  },

  toggleLike: async (idOrSlug: string, userId: string) => {
    return await articleRepository.toggleLike(idOrSlug, userId);
  },
};
