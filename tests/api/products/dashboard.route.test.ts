import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { ApiError } from '@/lib/error';
import { productService } from '@/services/product.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../../../src/app/api/products/dashboard/route';

const mockService = vi.mocked(productService);
const mockAuth = vi.mocked(AuthHelper);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/products/dashboard', { tags: ['backend'] }, () => {
  it('should reject non-admin users', async () => {
    mockAuth.requireAdmin.mockRejectedValue(
      new ApiError('Akses khusus admin', 403),
    );

    const req = new Request('http://localhost/api/products/dashboard');
    const res = await GET(req, { params: Promise.resolve({}) });

    expect(res.status).toBe(403);
    expect(mockService.getDashboardOverview).not.toHaveBeenCalled();
  });

  it('should return product dashboard overview data', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin',
      role: 'admin',
    } as never);
    mockService.getDashboardOverview.mockResolvedValue({
      totalProducts: 12,
      lowStockItems: [
        {
          name: 'Batik Jawa Premium',
          category: 'Batik',
          stock: 3,
          severity: 'low',
        },
      ],
    } as never);

    const req = new Request('http://localhost/api/products/dashboard');
    const res = await GET(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual({
      totalProducts: 12,
      lowStockItems: [
        {
          name: 'Batik Jawa Premium',
          category: 'Batik',
          stock: 3,
          severity: 'low',
        },
      ],
    });
    expect(mockService.getDashboardOverview).toHaveBeenCalledWith();
  });
});
