import {
  articleKeys,
  fetchArticleDashboard,
  fetchArticleDetail,
  fetchArticles,
  fetchLikedArticles,
  toggleArticleLike,
  useArticleDashboard,
  useArticleDetail,
  useArticles,
  useLikedArticles,
  useToggleArticleLike,
} from '@/hooks/use-article';
import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createWrapper(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    ...config,
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

describe('use-article hooks', { tags: ['frontend'] }, () => {
  it('should unwrap article list responses from JSend', async () => {
    const articles = {
      items: [{ slug: 'article-1', title: 'Article 1' }],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        islands: [{ name: 'Semua Pulau', count: 1, active: true }],
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(articles) as never,
    );

    const result = await fetchArticles(1, 10);

    expect(result).toEqual(articles);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles?page=1&limit=10',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should unwrap article detail responses from JSend', async () => {
    const article = { slug: 'batik', title: 'Batik' };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(article) as never,
    );

    const result = await fetchArticleDetail('batik');

    expect(result).toEqual(article);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles/batik',
      expect.any(Object),
    );
  });

  it('should unwrap article dashboard responses from JSend', async () => {
    const articleDashboard = {
      totalArticles: 12,
      popularArticles: [
        {
          rank: 1,
          title: 'Sejarah Batik Jawa: Warisan Dunia UNESCO',
          category: 'Sejarah & Asal Usul',
          region: 'Jawa',
          views: 2100,
          readTimeMinutes: 8,
        },
      ],
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(articleDashboard) as never,
    );

    const result = await fetchArticleDashboard();

    expect(result).toEqual(articleDashboard);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles/dashboard',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should unwrap liked article responses from JSend', async () => {
    const likedArticles = {
      items: [
        {
          id: 'article-1',
          slug: 'batik',
          region: 'Jawa',
          topic: 'Sejarah',
          motifLabel: 'Batik',
          title: 'Batik',
          excerpt: 'Excerpt',
          likes: 2,
          views: '10',
          readMinutes: 6,
        },
      ],
      meta: {
        page: 2,
        limit: 5,
        totalItems: 6,
        totalPages: 2,
        hasNextPage: false,
      },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse(likedArticles) as never,
    );

    const result = await fetchLikedArticles(2, 5);

    expect(result).toEqual(likedArticles);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles/liked?page=2&limit=5',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should post to toggle article like', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        isLiked: true,
        engagement: {
          likeCount: 3,
          viewCount: 10,
        },
      }) as never,
    );

    const result = await toggleArticleLike('batik');

    expect(result).toEqual({
      isLiked: true,
      engagement: {
        likeCount: 3,
        viewCount: 10,
      },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles/batik/like',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should expose loading then success for useArticles', async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    vi.spyOn(global, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }) as never,
    );

    const { result } = renderHook(() => useArticles(1, 50), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);

    resolveFetch?.(
      createSuccessResponse({
        items: [
          {
            slug: 'article-1',
            region: 'Jawa',
            topic: 'Sejarah',
            motifLabel: 'Batik',
            title: 'Article 1',
            excerpt: 'Excerpt',
            likes: 1,
            views: '10',
          },
        ],
        meta: {
          page: 1,
          limit: 50,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          islands: [{ name: 'Semua Pulau', count: 1, active: true }],
        },
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.meta.totalPages).toBe(1);
  });

  it('should include island in the article list query', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        items: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          islands: [{ name: 'Semua Pulau', count: 0, active: true }],
          topics: [],
        },
      }) as never,
    );

    await fetchArticles(1, 10, { island: 'Jawa' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles?page=1&limit=10&island=Jawa',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should include topic in the article list query', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        items: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          regions: [{ name: 'Semua Wilayah', count: 0, active: true }],
          topics: [],
        },
      }) as never,
    );

    await fetchArticles(1, 10, { topic: 'Teknik Pembuatan' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/articles?page=1&limit=10&topic=Teknik+Pembuatan',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should expose success for useArticleDetail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        slug: 'batik',
        region: 'Jawa',
        topic: 'Sejarah',
        motifLabel: 'Batik',
        title: 'Batik',
        excerpt: 'Excerpt',
        likes: 10,
        views: '100',
        author: 'Admin',
        publishedAt: '10 Mar 2025',
        tags: ['Batik'],
        quote: 'Quote',
        intro: 'Intro',
        sections: [],
        keyFacts: [],
        relatedProducts: [],
        discussionCount: 0,
        nextArticle: {
          slug: 'next',
          title: 'Next',
        },
        references: ['[1] Wikipedia'],
      }) as never,
    );

    const { result } = renderHook(() => useArticleDetail('batik'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.slug).toBe('batik');
  });

  it('should expose success for useArticleDashboard', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        totalArticles: 12,
        popularArticles: [
          {
            rank: 1,
            title: 'Sejarah Batik Jawa: Warisan Dunia UNESCO',
            category: 'Sejarah & Asal Usul',
            region: 'Jawa',
            views: 2100,
            readTimeMinutes: 8,
          },
        ],
      }) as never,
    );

    const { result } = renderHook(() => useArticleDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalArticles).toBe(12);
    expect(result.current.data?.popularArticles[0]?.title).toBe(
      'Sejarah Batik Jawa: Warisan Dunia UNESCO',
    );
  });

  it('should expose success for useLikedArticles', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createSuccessResponse({
        items: [
          {
            id: 'article-1',
            slug: 'batik',
            region: 'Jawa',
            topic: 'Sejarah',
            motifLabel: 'Batik',
            title: 'Batik',
            excerpt: 'Excerpt',
            likes: 2,
            views: '10',
            readMinutes: 6,
          },
        ],
        meta: {
          page: 2,
          limit: 5,
          totalItems: 6,
          totalPages: 2,
          hasNextPage: false,
        },
      }) as never,
    );

    const { result } = renderHook(() => useLikedArticles(2, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items[0]?.slug).toBe('batik');
    expect(result.current.data?.meta.page).toBe(2);
  });

  it('should expose error state when the API returns fail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      createFailResponse({ message: 'Artikel tidak ditemukan' }, 404) as never,
    );

    const { result } = renderHook(() => useArticleDetail('missing'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Artikel tidak ditemukan');
  });

  it('should update the detail cache when toggling like succeeds', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        createSuccessResponse({
          slug: 'batik',
          region: 'Jawa',
          topic: 'Sejarah',
          motifLabel: 'Batik',
          title: 'Batik',
          excerpt: 'Excerpt',
          likes: 10,
          views: '100',
          author: 'Admin',
          publishedAt: '10 Mar 2025',
          tags: ['Batik'],
          quote: 'Quote',
          intro: 'Intro',
          sections: [],
          keyFacts: [],
          relatedProducts: [],
          discussionCount: 0,
          nextArticle: {
            slug: 'next',
            title: 'Next',
          },
          references: ['[1] Wikipedia'],
        }) as never,
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          isLiked: true,
          engagement: {
            likeCount: 11,
            viewCount: 100,
          },
        }) as never,
      );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result: detailResult } = renderHook(
      () => useArticleDetail('batik'),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(detailResult.current.isSuccess).toBe(true));

    const { result: likeResult } = renderHook(
      () => useToggleArticleLike('batik'),
      {
        wrapper,
      },
    );

    await likeResult.current.mutateAsync();

    await waitFor(() =>
      expect(
        queryClient.getQueryData(articleKeys.detail('batik')),
      ).toMatchObject({
        likes: 11,
        isLiked: true,
      }),
    );
  });
});
