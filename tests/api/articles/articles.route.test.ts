import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { articleService } from '@/services/article.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from '../../../src/app/api/articles/route';

const mockService = vi.mocked(articleService);
const mockAuth = vi.mocked(AuthHelper);

const MOCK_ARTICLES = {
  items: [
    { id: '1', title: 'Article 1', slug: 'article-1' },
    { id: '2', title: 'Article 2', slug: 'article-2' },
  ],
  meta: {
    page: 1,
    limit: 10,
    totalItems: 2,
    totalPages: 1,
    hasNextPage: false,
    islands: [{ name: 'Semua Pulau', count: 2, active: true }],
    topics: ['Sejarah & Asal Usul'],
  },
};

function createRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/articles', { tags: ['backend'] }, () => {
  it('should return articles list', async () => {
    mockService.getArticles.mockResolvedValue(MOCK_ARTICLES as never);

    const req = createRequest('http://localhost/api/articles');
    const res = await GET(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual(MOCK_ARTICLES);
    expect(mockService.getArticles).toHaveBeenCalledWith(1, 10, {
      island: undefined,
      topic: undefined,
      includeUnpublished: false,
    });
  });

  it('should parse page, limit, and island from query params', async () => {
    mockService.getArticles.mockResolvedValue({
      items: [],
      meta: {
        page: 3,
        limit: 20,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        islands: [{ name: 'Semua Pulau', count: 0, active: false }],
        topics: [],
      },
    } as never);

    const req = createRequest(
      'http://localhost/api/articles?page=3&limit=20&island=Jawa',
    );
    await GET(req, { params: Promise.resolve({}) });

    expect(mockService.getArticles).toHaveBeenCalledWith(3, 20, {
      island: 'Jawa',
      topic: undefined,
      includeUnpublished: false,
    });
  });

  it('should parse topic from query params', async () => {
    mockService.getArticles.mockResolvedValue({
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
    } as never);

    const req = createRequest(
      'http://localhost/api/articles?page=1&limit=10&topic=Teknik%20Pembuatan',
    );
    await GET(req, { params: Promise.resolve({}) });

    expect(mockService.getArticles).toHaveBeenCalledWith(1, 10, {
      island: undefined,
      topic: 'Teknik Pembuatan',
      includeUnpublished: false,
    });
  });
});

describe('GET /api/articles drafts', { tags: ['backend'] }, () => {
  const request = () =>
    createRequest('http://localhost/api/articles?includeUnpublished=true');

  it('should ignore includeUnpublished for guests', async () => {
    mockAuth.getUser.mockResolvedValue(null as never);
    mockService.getArticles.mockResolvedValue(MOCK_ARTICLES as never);

    await GET(request(), { params: Promise.resolve({}) });

    expect(mockService.getArticles).toHaveBeenCalledWith(
      1,
      10,
      expect.objectContaining({ includeUnpublished: false }),
    );
  });

  it('should honour includeUnpublished for admins', async () => {
    mockAuth.getUser.mockResolvedValue({ id: 'a', role: 'admin' } as never);
    mockService.getArticles.mockResolvedValue(MOCK_ARTICLES as never);

    await GET(request(), { params: Promise.resolve({}) });

    expect(mockService.getArticles).toHaveBeenCalledWith(
      1,
      10,
      expect.objectContaining({ includeUnpublished: true }),
    );
  });
});

describe('POST /api/articles', { tags: ['backend'] }, () => {
  const validArticle = {
    title: 'New Article',
    excerpt: 'New article excerpt',
    province: 'Bali',
    island: 'Bali',
    region: 'Denpasar',
    topic: 'Teknik Pembuatan',
    clothingType: 'endek',
    motifLabel: 'Endek',
    gender: 'female',
    imageURL: 'https://example.com/image.jpg',
    sections: [
      {
        title: 'Pembuka',
        content: 'New content',
        order: 0,
      },
    ],
  };

  it('should create article as admin and return 201', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as never);
    mockService.createArticle.mockResolvedValue({
      id: 'new-id',
      ...validArticle,
    } as never);

    const req = createRequest('http://localhost/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validArticle),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.status).toBe('success');
    expect(mockAuth.requireAdmin).toHaveBeenCalled();
    expect(mockService.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Article' }),
      'admin-1',
    );
  });

  it('should return 400 on invalid body (Zod validation)', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as never);

    const req = createRequest('http://localhost/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }), // missing current required fields
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe('fail');
  });
});
