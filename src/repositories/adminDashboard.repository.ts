import { ROLES } from '@/lib/auth/roles';
import prisma from '@/lib/prisma';

/**
 * Dedicated read-only repository for the admin dashboard overview.
 *
 * Intentionally self-contained (does not reuse the order/article repositories)
 * so dashboard aggregation can evolve without touching shared query code.
 */
export const adminDashboardRepository = {
  /**
   * Gross Merchandise Value: sum of `totalAmount` for orders marked paid whose
   * payment landed within [start, end). We key off `paidAt` (not `createdAt`)
   * so GMV reflects when money actually came in.
   */
  sumPaidGmvBetween: async (start: Date, end: Date) => {
    const result = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: 'paid',
        paidAt: { gte: start, lt: end },
      },
    });
    return Number(result._sum.totalAmount ?? 0);
  },

  /** Number of registered users holding the seller role. */
  countRegisteredSellers: async () => {
    return prisma.user.count({ where: { role: ROLES.SELLER } });
  },

  /** Number of distinct sellers that have at least one order. */
  countActiveSellers: async () => {
    const groups = await prisma.order.groupBy({
      by: ['sellerId'],
      where: { sellerId: { not: null } },
    });
    return groups.length;
  },

  /** Cumulative article views across every article (no time dimension). */
  sumArticleViews: async () => {
    const result = await prisma.articleEngagement.aggregate({
      _sum: { viewCount: true },
    });
    return Number(result._sum.viewCount ?? 0);
  },

  /**
   * Timestamps of article likes since `since`. Used as the closest honest
   * daily-traffic proxy for the "Trafik Artikel" chart (see service comment):
   * `ArticleEngagement.viewCount` has no per-day breakdown, whereas each
   * `UserArticleLike` is a real, time-stamped article-engagement event.
   */
  findArticleLikesSince: async (since: Date) => {
    return prisma.userArticleLike.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
  },

  /** Top sellers by paid GMV, with their paid-order count. */
  findTopSellersByGmv: async (limit: number = 5) => {
    const groups = await prisma.order.groupBy({
      by: ['sellerId'],
      where: { sellerId: { not: null }, paymentStatus: 'paid' },
      _sum: { totalAmount: true },
      _count: { _all: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    const sellerIds = groups
      .map((group) => group.sellerId)
      .filter((id): id is string => id !== null);

    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(sellers.map((seller) => [seller.id, seller.name]));

    return groups.map((group) => ({
      sellerId: group.sellerId as string,
      name: nameById.get(group.sellerId as string) ?? 'Seller',
      gmv: Number(group._sum.totalAmount ?? 0),
      orderCount: group._count._all,
    }));
  },

  /** Most-viewed published articles (mirrors the encyclopedia popularity query). */
  findPopularArticles: async (limit: number = 6) => {
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
};
