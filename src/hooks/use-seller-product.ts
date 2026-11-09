import { fetchApi, mutateApi } from '@/lib/api-client';
import {
  type CreateProductInput,
  type UpdateProductInput,
} from '@/schemas/product.schema';
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

export const sellerProductKeys = {
  all: ['seller-product'] as const,
  lists: () => [...sellerProductKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...sellerProductKeys.lists(), page, limit] as const,
  articles: () => [...sellerProductKeys.all, 'article-options'] as const,
  articlePages: (limit: number) =>
    [...sellerProductKeys.articles(), 'pages', limit] as const,
  clothingTypes: () => [...sellerProductKeys.all, 'clothing-types'] as const,
};

const ARTICLE_OPTIONS_LIMIT = 20;

export function fetchSellerProducts(page: number = 1, limit: number = 10) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return fetchApi<ProductInventoryListResponse>(
    `/api/seller/products?${searchParams.toString()}`,
  );
}

export function fetchClothingTypeOptions() {
  return fetchApi<string[]>('/api/products/clothing-types');
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

export function useSellerProducts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: sellerProductKeys.list(page, limit),
    queryFn: () => fetchSellerProducts(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useArticleOptions() {
  return useInfiniteQuery({
    queryKey: sellerProductKeys.articlePages(ARTICLE_OPTIONS_LIMIT),
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
    queryKey: sellerProductKeys.clothingTypes(),
    queryFn: fetchClothingTypeOptions,
    // Always refetch when the form opens so entries other users just added
    // show up; the cached list still renders instantly meanwhile.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      mutateApi<ProductInventoryItem>('/api/seller/products', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all });
    },
  });
}

export function useUpdateSellerProduct() {
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
        `/api/seller/products/${encodeURIComponent(idOrSlug)}`,
        'PUT',
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all });
    },
  });
}

export function useDeleteSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idOrSlug: string) =>
      mutateApi<null>(
        `/api/seller/products/${encodeURIComponent(idOrSlug)}`,
        'DELETE',
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all });
    },
  });
}
