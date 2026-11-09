import {
  fetchProductCatalog,
  fetchProductCatalogDetail,
  productCatalogKeys,
  useProductCatalog,
  useProductCatalogDetail,
} from '@/hooks/use-product-catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function createSuccessResponse<T>(data: T, status = 200) {
  return new Response(
    JSON.stringify({
      status: 'success',
      data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

function createFailResponse(data: unknown, status = 400) {
  return new Response(
    JSON.stringify({
      status: 'fail',
      data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('use-product-catalog hooks', { tags: ['frontend'] }, () => {
  const MOCK_PRODUCT_LIST = {
    items: [
      {
        id: 'prod-1',
        articleId: 'article-1',
        articleTitle: 'Batik Pekalongan',
        name: 'Premium Batik Shirt',
        slug: 'premium-batik-shirt',
        description: 'A nice shirt.',
        price: 250000,
        stock: 20,
        sku: 'BPK-001',
        weight: 300,
        island: 'Jawa',
        province: 'Jawa Tengah',
        clothingType: 'Batik',
        gender: 'male',
        status: 'active',
        sold: 1,
        variants: [
          {
            id: 'variant-1',
            name: 'Size L',
            type: 'size',
            price: 250000,
            stock: 12,
            sku: 'BPK-L',
          },
          {
            id: 'variant-2',
            name: 'Size XL',
            type: 'size',
            price: 275000,
            stock: 8,
            sku: 'BPK-XL',
          },
        ],
        variantCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    meta: {
      page: 1,
      limit: 9,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
    },
  };

  const MOCK_PRODUCT_DETAIL = MOCK_PRODUCT_LIST.items[0];

  it('should build catalog query key with filters', () => {
    const key = productCatalogKeys.list(2, 9, {
      island: 'Jawa',
      sortBy: 'price_desc',
    });

    expect(key).toEqual([
      'product-catalog',
      'list',
      2,
      9,
      { island: 'Jawa', sortBy: 'price_desc' },
    ]);
  });

  it('should fetch product catalog list with default params', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_PRODUCT_LIST) as never,
    );

    const result = await fetchProductCatalog();

    expect(result).toEqual(MOCK_PRODUCT_LIST);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products?page=1&limit=9',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should include selected filters in catalog request params', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_PRODUCT_LIST) as never,
    );

    await fetchProductCatalog(2, 12, {
      minPrice: 100000,
      maxPrice: 500000,
      island: 'Jawa',
      clothingType: 'Batik',
      gender: 'male',
      inStock: true,
      sortBy: 'price_desc',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products?page=2&limit=12&minPrice=100000&maxPrice=500000&island=Jawa&clothingType=Batik&gender=male&inStock=true&sortBy=price_desc',
      expect.any(Object),
    );
  });

  it('should fetch product catalog detail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_PRODUCT_DETAIL) as never,
    );

    const result = await fetchProductCatalogDetail('prod-1');

    expect(result).toEqual(MOCK_PRODUCT_DETAIL);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products/prod-1',
      expect.any(Object),
    );
  });

  it('should expose success state for useProductCatalog', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_PRODUCT_LIST) as never,
    );

    const { result } = renderHook(() => useProductCatalog(1, 9), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_PRODUCT_LIST);
  });

  it('should expose success state for useProductCatalogDetail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(MOCK_PRODUCT_DETAIL) as never,
    );

    const { result } = renderHook(() => useProductCatalogDetail('prod-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('prod-1');
  });

  it('should not fetch detail when idOrSlug is empty', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    const { result } = renderHook(() => useProductCatalogDetail(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should expose error state when API returns fail status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createFailResponse({ message: 'Request failed from API' }, 400) as never,
    );

    const { result } = renderHook(() => useProductCatalog(1, 9), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Request failed from API');
  });
});
