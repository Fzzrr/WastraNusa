import { type JSendResponse } from '@/lib/jsend';
import type {
  ProductCatalogFilters,
  ProductInventoryItem,
  ProductInventoryListResponse,
} from '@/types/product';
import { useQuery } from '@tanstack/react-query';

const DEFAULT_CATALOG_LIMIT = 9;

export const productCatalogKeys = {
  all: ['product-catalog'] as const,
  lists: () => [...productCatalogKeys.all, 'list'] as const,
  list: (page: number, limit: number, filters: ProductCatalogFilters = {}) =>
    [...productCatalogKeys.lists(), page, limit, filters] as const,
  details: () => [...productCatalogKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) =>
    [...productCatalogKeys.details(), idOrSlug] as const,
};

async function parseJSend<T>(response: Response): Promise<T> {
  const body = (await response.json()) as JSendResponse<T>;

  if (body.status === 'success') {
    return body.data as T;
  }

  if (body.status === 'fail') {
    const message =
      typeof body.data === 'object' &&
      body.data !== null &&
      'message' in body.data
        ? String(body.data.message)
        : 'Request failed';

    throw new Error(message);
  }

  throw new Error(body.message);
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseJSend<T>(response);
}

export function fetchProductCatalog(
  page: number = 1,
  limit: number = DEFAULT_CATALOG_LIMIT,
  filters: ProductCatalogFilters = {},
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (typeof filters.minPrice === 'number') {
    searchParams.set('minPrice', String(filters.minPrice));
  }

  if (typeof filters.maxPrice === 'number') {
    searchParams.set('maxPrice', String(filters.maxPrice));
  }

  if (filters.island) {
    searchParams.set('island', filters.island);
  }

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.size) {
    searchParams.set('size', filters.size);
  }

  if (filters.clothingType) {
    searchParams.set('clothingType', filters.clothingType);
  }

  if (filters.gender) {
    searchParams.set('gender', filters.gender);
  }

  if (filters.status) {
    searchParams.set('status', filters.status);
  }

  if (typeof filters.inStock === 'boolean') {
    searchParams.set('inStock', String(filters.inStock));
  }

  if (filters.sortBy) {
    searchParams.set('sortBy', filters.sortBy);
  }

  return fetchApi<ProductInventoryListResponse>(
    `/api/products?${searchParams.toString()}`,
  );
}

export function fetchProductCatalogDetail(idOrSlug: string) {
  return fetchApi<ProductInventoryItem>(
    `/api/products/${encodeURIComponent(idOrSlug)}`,
  );
}

export function useProductCatalog(
  page: number = 1,
  limit: number = DEFAULT_CATALOG_LIMIT,
  filters: ProductCatalogFilters = {},
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: productCatalogKeys.list(page, limit, filters),
    queryFn: () => fetchProductCatalog(page, limit, filters),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}

export function useProductCatalogDetail(idOrSlug: string) {
  return useQuery({
    queryKey: productCatalogKeys.detail(idOrSlug),
    queryFn: () => fetchProductCatalogDetail(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}
