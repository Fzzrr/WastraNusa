import { adminDashboardRepository } from '@/repositories/adminDashboard.repository';
import { type PopularArticle } from '@/types/dashboard';

export type AdminDashboardData = {
  gmv: {
    currentMonth: number;
    lastMonth: number;
    /** Month-over-month change, or null when last month had no GMV to compare. */
    changePercent: number | null;
  };
  sellers: {
    /** Sellers with at least one order. */
    active: number;
    /** Users holding the seller role. */
    registered: number;
  };
  articleViews: {
    total: number;
  };
  /** Daily article-engagement traffic for the last 7 days (oldest → newest). */
  articleTraffic: Array<{ label: string; value: number }>;
  /** Top sellers ranked by paid GMV. */
  topSellers: Array<{ name: string; gmv: number; orderCount: number }>;
  popularArticles: PopularArticle[];
};

const WEEKDAY_LABELS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const adminDashboardService = {
  getOverview: async (): Promise<AdminDashboardData> => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Traffic window: the last 7 calendar days including today.
    const todayStart = startOfDay(now);
    const trafficStart = new Date(todayStart);
    trafficStart.setDate(trafficStart.getDate() - 6);

    const [
      gmvCurrentMonth,
      gmvLastMonth,
      registeredSellers,
      activeSellers,
      articleViews,
      likeEvents,
      topSellers,
      popularArticles,
    ] = await Promise.all([
      adminDashboardRepository.sumPaidGmvBetween(
        currentMonthStart,
        nextMonthStart,
      ),
      adminDashboardRepository.sumPaidGmvBetween(
        lastMonthStart,
        currentMonthStart,
      ),
      adminDashboardRepository.countRegisteredSellers(),
      adminDashboardRepository.countActiveSellers(),
      adminDashboardRepository.sumArticleViews(),
      adminDashboardRepository.findArticleLikesSince(trafficStart),
      adminDashboardRepository.findTopSellersByGmv(5),
      adminDashboardRepository.findPopularArticles(6),
    ]);

    // NOTE (Trafik Artikel): there is no per-day article-view table
    // (`ArticleEngagement.viewCount` is a running total with no timestamps), so
    // daily article traffic is approximated from `UserArticleLike` events —
    // real, time-stamped article-engagement actions — bucketed per day.
    const traffic: Array<{ label: string; value: number }> = Array.from(
      { length: 7 },
      (_, index) => {
        const day = new Date(trafficStart);
        day.setDate(day.getDate() + index);
        return { label: WEEKDAY_LABELS_ID[day.getDay()], value: 0 };
      },
    );
    for (const like of likeEvents) {
      const dayIndex = Math.floor(
        (startOfDay(new Date(like.createdAt)).getTime() -
          trafficStart.getTime()) /
          (24 * 60 * 60 * 1000),
      );
      if (dayIndex >= 0 && dayIndex < traffic.length) {
        traffic[dayIndex].value += 1;
      }
    }

    const changePercent =
      gmvLastMonth > 0
        ? ((gmvCurrentMonth - gmvLastMonth) / gmvLastMonth) * 100
        : null;

    return {
      gmv: {
        currentMonth: gmvCurrentMonth,
        lastMonth: gmvLastMonth,
        changePercent,
      },
      sellers: {
        active: activeSellers,
        registered: registeredSellers,
      },
      articleViews: {
        total: articleViews,
      },
      articleTraffic: traffic,
      topSellers: topSellers.map((seller) => ({
        name: seller.name,
        gmv: seller.gmv,
        orderCount: seller.orderCount,
      })),
      popularArticles: popularArticles.map((item, index) => ({
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
};
