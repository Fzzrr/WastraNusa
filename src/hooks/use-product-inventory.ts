import type { JSendResponse } from '@/lib/jsend';
import {
  type CreateProductInput,
  type UpdateProductInput,
} from '@/schemas/product.schema';
import { type ProductDashboardData } from '@/types/dashboard';
import type {
  ArticleOptionItem,
  ProductInventoryItem,
  ProductInventoryListResponse,
} from '@/types/product';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const productInventoryKeys = {
  all: ['product-inventory'] as const,
  lists: () => [...productInventoryKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...productInventoryKeys.lists(), page, limit] as const,
  details: () => [...productInventoryKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) =>
    [...productInventoryKeys.details(), idOrSlug] as const,
  dashboard: () => [...productInventoryKeys.all, 'dashboard'] as const,
  articles: () => [...productInventoryKeys.all, 'article-options'] as const,
  articlePages: (limit: number) =>
    [...productInventoryKeys.articles(), 'pages', limit] as const,
  clothingTypes: () => [...productInventoryKeys.all, 'clothing-types'] as const,
};

const ARTICLE_OPTIONS_LIMIT = 20;

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

async function mutateApi<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJSend<T>(response);
}

export function fetchProductInventories(page: number = 1, limit: number = 10) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    includeOutOfStock: 'true',
  });

  return fetchApi<ProductInventoryListResponse>(
    `/api/products?${searchParams.toString()}`,
  );
}

export function fetchClothingTypeOptions() {
  return fetchApi<string[]>('/api/products/clothing-types');
}

export function fetchProductInventoryDetail(idOrSlug: string) {
  return fetchApi<ProductInventoryItem>(
    `/api/products/${encodeURIComponent(idOrSlug)}`,
  );
}

export function fetchProductDashboard() {
  return fetchApi<ProductDashboardData>('/api/products/dashboard');
}

type ArticleOptionsPage = {
  items: ArticleOptionItem[];
  meta: {
    page: number;
    hasNextPage: boolean;
  };
};

export function fetchArticleOptionsPage(
  page: number = 1,
  limit: number = ARTICLE_OPTIONS_LIMIT,
) {
  return fetchApi<{
    items: {
      id: string;
      title: string;
      island?: string | null;
      province?: string | null;
    }[];
    meta: { page: number; hasNextPage: boolean };
  }>(`/api/articles?page=${page}&limit=${limit}`).then(
    (result): ArticleOptionsPage => ({
      items: result.items.map(
        (item): ArticleOptionItem => ({
          id: item.id,
          title: item.title,
          island: item.island ?? '',
          province: item.province ?? '',
        }),
      ),
      meta: {
        page: result.meta.page,
        hasNextPage: result.meta.hasNextPage,
      },
    }),
  );
}

export function useProductInventories(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: productInventoryKeys.list(page, limit),
    queryFn: () => fetchProductInventories(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useProductInventoryDetail(idOrSlug: string) {
  return useQuery({
    queryKey: productInventoryKeys.detail(idOrSlug),
    queryFn: () => fetchProductInventoryDetail(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useProductDashboard() {
  return useQuery({
    queryKey: productInventoryKeys.dashboard(),
    queryFn: () => fetchProductDashboard(),
  });
}

export function useArticleOptions() {
  return useInfiniteQuery({
    queryKey: productInventoryKeys.articlePages(ARTICLE_OPTIONS_LIMIT),
    queryFn: ({ pageParam }) =>
      fetchArticleOptionsPage(pageParam, ARTICLE_OPTIONS_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClothingTypeOptions() {
  return useQuery({
    queryKey: productInventoryKeys.clothingTypes(),
    queryFn: fetchClothingTypeOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProductInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      mutateApi<ProductInventoryItem>('/api/products', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productInventoryKeys.all });
    },
  });
}

export function useUpdateProductInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      idOrSlug,
      data,
    }: {
      idOrSlug: string;
      data: UpdateProductInput;
    }) =>
      mutateApi<ProductInventoryItem>(
        `/api/products/${encodeURIComponent(idOrSlug)}`,
        'PUT',
        data,
      ),
    onSuccess: (_, { idOrSlug }) => {
      queryClient.invalidateQueries({ queryKey: productInventoryKeys.all });
      queryClient.invalidateQueries({
        queryKey: productInventoryKeys.detail(idOrSlug),
      });
    },
  });
}

export function useDeleteProductInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idOrSlug: string) =>
      mutateApi<null>(
        `/api/products/${encodeURIComponent(idOrSlug)}`,
        'DELETE',
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productInventoryKeys.all });
    },
  });
}
