import { fetchApi } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => fetchApi<string[]>('/api/products/categories'),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
