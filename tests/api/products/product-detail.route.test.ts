import { GET } from '@/app/api/products/[id]/route';
import { ApiError } from '@/lib/error';
import { productService } from '@/services/product.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockService = vi.mocked(productService);

const MOCK_PRODUCT = {
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
  clothingType: 'batik',
  gender: 'male',
  status: 'active',
  sold: 0,
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
};

function createRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/products/[id]', { tags: ['backend'] }, () => {
  it('should return product detail', async () => {
    mockService.getProductDetail.mockResolvedValue(MOCK_PRODUCT as never);

    const req = createRequest('http://localhost/api/products/prod-1');
    const res = await GET(req, { params: Promise.resolve({ id: 'prod-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual(MOCK_PRODUCT);
    expect(mockService.getProductDetail).toHaveBeenCalledWith('prod-1');
  });

  it('should return 404 when product not found (via service)', async () => {
    mockService.getProductDetail.mockRejectedValue(
      new ApiError('Produk tidak ditemukan', 404),
    );

    const req = createRequest('http://localhost/api/products/nonexistent');
    const res = await GET(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.status).toBe('fail');
    expect(body.data.message).toBe('Produk tidak ditemukan');
  });
});
