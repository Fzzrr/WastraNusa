/** Public catalog data, always mapped from DB rows rather than model output. */
export interface ChatProduct {
  slug: string;
  name: string;
  description: string | null;
  imageURL: string | null;
  priceMin: number;
  priceMax: number;
  href: string;
}

export interface ChatAnswer {
  reply: string;
  articleId: string;
  cached?: boolean;
  products?: ChatProduct[];
}
