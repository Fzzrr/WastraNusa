export type DashboardNavItem = {
  title: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
};

export type PopularArticle = {
  rank: number;
  slug: string;
  title: string;
  category: string;
  region: string;
  views: number;
  readTimeMinutes: number;
};

export type ArticleDashboardData = {
  totalArticles: number;
  popularArticles: PopularArticle[];
  weeklyDelta?: number;
  monthlyDelta?: number;
};
