import { ArticleStatus, Gender } from '@/generated/prisma/enums';

/**
 * Type definitions for Encyclopedia components
 */

export interface Stat {
  value: string;
  label: string;
}

export interface IslandFilter {
  name: string;
  count: number;
  active?: boolean;
}

export interface EncyclopediaArticleFilters {
  island?: string;
  topic?: string;
  /** Free-text search, matched in the database. */
  q?: string;
}

export interface EncyclopediaArticle {
  slug: string;
  region: string;
  topic: string;
  motifLabel: string;
  title: string;
  excerpt: string;
  likes: number;
  isLiked?: boolean;
  views: string;
  readMinutes: number;
  featured: boolean;
  province?: string | null;
  island?: string | null;
  ethnicGroup?: string | null;
  clothingType?: string | null;
  gender?: Gender | null;
  status: ArticleStatus;
  summary?: string | null;
  description?: string | null;
  imageURL?: string | null;
}

export interface EncyclopediaSection {
  title: string;
  content: string;
  imageLabel?: string;
  imageCaption?: string;
  imageURL?: string;
}

export interface EncyclopediaKeyFact {
  label: string;
  value: string;
}

export interface EncyclopediaRelatedProduct {
  slug: string;
  name: string;
  location: string;
  price: string;
  imageURL?: string | null;
}

export interface EncyclopediaArticleDetail extends EncyclopediaArticle {
  author: string;
  publishedAt: string;
  tags: string[];
  quote: string;
  intro: string;
  sections: EncyclopediaSection[];
  keyFacts: EncyclopediaKeyFact[];
  relatedProducts: EncyclopediaRelatedProduct[];
  discussionCount: number;
  nextArticle: {
    slug: string;
    title: string;
  };
  references: string[];
}

export interface EncyclopediaArticleListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  islands: IslandFilter[];
  topics: string[];
  stats?: {
    totalArticles: number;
    totalIslands: number;
    totalWastraTypes: number;
    totalProvinces: number;
  };
}

export interface EncyclopediaArticleListResponse {
  items: EncyclopediaArticle[];
  meta: EncyclopediaArticleListMeta;
}

export interface ToggleArticleLikeResponse {
  isLiked: boolean;
  engagement: {
    likeCount: number;
    viewCount: number;
  };
}
