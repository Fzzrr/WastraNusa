import { articleService } from '@/services/article.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../../../src/app/api/articles/dashboard/route';

const mockService = vi.mocked(articleService);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/articles/dashboard', { tags: ['backend'] }, () => {
  it('should return dashboard article overview data', async () => {
    mockService.getDashboardOverview.mockResolvedValue({
      totalArticles: 12,
      popularArticles: [
        {
          rank: 1,
          slug: 'sejarah-batik-jawa',
          title: 'Sejarah Batik Jawa: Warisan Dunia UNESCO',
          category: 'Sejarah & Asal Usul',
          region: 'Jawa',
          views: 2100,
          readTimeMinutes: 8,
        },
      ],
    });

    const req = new Request('http://localhost/api/articles/dashboard');
    const res = await GET(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual({
      totalArticles: 12,
      popularArticles: [
        {
          rank: 1,
          slug: 'sejarah-batik-jawa',
          title: 'Sejarah Batik Jawa: Warisan Dunia UNESCO',
          category: 'Sejarah & Asal Usul',
          region: 'Jawa',
          views: 2100,
          readTimeMinutes: 8,
        },
      ],
    });
    expect(mockService.getDashboardOverview).toHaveBeenCalledWith();
  });
});
