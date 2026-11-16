import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { articleService } from '@/services/article.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, GET, PUT } from '../../../src/app/api/articles/[id]/route';

const mockService = vi.mocked(articleService);
const mockAuth = vi.mocked(AuthHelper);

const MOCK_ARTICLE = {
  id: 'article-1',
  title: 'Test Article',
  slug: 'test-article',
  content: 'Content',
};

function createRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/articles/[id]', { tags: ['backend'] }, () => {
  it('should return article detail', async () => {
    mockAuth.getUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);
    mockService.getArticleDetail.mockResolvedValue(MOCK_ARTICLE as never);

    const req = createRequest('http://localhost/api/articles/article-1');
    const res = await GET(req, {
      params: Promise.resolve({ id: 'article-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual(MOCK_ARTICLE);
    expect(mockService.getArticleDetail).toHaveBeenCalledWith(
      'article-1',
      'user-1',
      false,
    );
  });
});

describe('PUT /api/articles/[id]', { tags: ['backend'] }, () => {
  it('should update article as admin', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as never);
    mockService.updateArticle.mockResolvedValue({
      ...MOCK_ARTICLE,
      title: 'Updated',
    } as never);

    const req = createRequest('http://localhost/api/articles/article-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'article-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(mockAuth.requireAdmin).toHaveBeenCalled();
    expect(mockService.updateArticle).toHaveBeenCalledWith(
      'article-1',
      expect.objectContaining({ title: 'Updated' }),
    );
  });

  it('should return 400 on invalid body', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as never);

    const req = createRequest('http://localhost/api/articles/article-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: 'invalid-gender' }),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'article-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe('fail');
  });
});

describe('DELETE /api/articles/[id]', { tags: ['backend'] }, () => {
  it('should delete article as admin', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as never);
    mockService.deleteArticle.mockResolvedValue(MOCK_ARTICLE as never);

    const req = createRequest('http://localhost/api/articles/article-1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'article-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toBeNull();
    expect(mockAuth.requireAdmin).toHaveBeenCalled();
    expect(mockService.deleteArticle).toHaveBeenCalledWith('article-1');
  });
});
