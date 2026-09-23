import type { EncyclopediaArticle } from '@/types/encyclopedia';
import type { ProductInventoryItem } from '@/types/product';

export const PRODUCT_SEARCH_LIMIT = 100;
export const ARTICLE_SEARCH_LIMIT = 500;

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Rank a candidate against the query so results sort "by letters":
 * a name that starts with the query ranks first, then an earlier match
 * position, then alphabetically. Returns null when there is no match.
 */
function rank(name: string, haystack: string, query: string): number | null {
  const lowerName = name.toLowerCase();

  if (lowerName.startsWith(query)) return 0;
  if (lowerName.includes(query)) return 1;

  const haystackIndex = haystack.indexOf(query);
  if (haystackIndex >= 0) return 2;

  return null;
}

function search<T>(
  items: T[],
  rawQuery: string,
  getName: (item: T) => string,
  getHaystackFields: (item: T) => Array<string | null | undefined>,
): T[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  return items
    .map((item) => {
      const haystack = getHaystackFields(item)
        .filter((field): field is string => Boolean(field))
        .join(' ')
        .toLowerCase();

      return { item, score: rank(getName(item), haystack, query) };
    })
    .filter((entry) => entry.score !== null)
    .sort(
      (a, b) =>
        (a.score as number) - (b.score as number) ||
        getName(a.item).localeCompare(getName(b.item)),
    )
    .map((entry) => entry.item);
}

export function searchProducts(
  products: ProductInventoryItem[],
  rawQuery: string,
): ProductInventoryItem[] {
  return search(
    products,
    rawQuery,
    (product) => product.name,
    (product) => [
      product.name,
      product.articleTitle,
      product.clothingType,
      product.island,
      product.province,
      product.description,
    ],
  );
}

export function searchArticles(
  articles: EncyclopediaArticle[],
  rawQuery: string,
): EncyclopediaArticle[] {
  return search(
    articles,
    rawQuery,
    (article) => article.title,
    (article) => [
      article.title,
      article.motifLabel,
      article.topic,
      article.region,
      article.island,
      article.province,
    ],
  );
}
