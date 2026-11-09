import { GET } from '@/app/api/products/route';
import { productService } from '@/services/product.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockService = vi.mocked(productService);

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
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    categories: [],
    islands: [],
    genders: [],
    priceRange: {
      min: 250000,
      max: 250000,
    },
    stats: {
      totalProducts: 1,
      totalCategories: 1,
      totalIslands: 1,
    },
  },
};

function createRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/products', { tags: ['backend'] }, () => {
  it('should return product list', async () => {
    mockService.getProducts.mockResolvedValue(MOCK_PRODUCT_LIST as never);

    const req = createRequest('http://localhost/api/products');
    const res = await GET(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual(MOCK_PRODUCT_LIST);
    expect(mockService.getProducts).toHaveBeenCalledWith(1, 10, {
      minPrice: undefined,
      maxPrice: undefined,
      island: undefined,
      size: undefined,
      clothingType: undefined,
      topic: undefined,
      gender: undefined,
      inStock: undefined,
      excludeOutOfStock: true,
      sortBy: undefined,
    });
  });

  it('should parse page, limit, and filter params from query', async () => {
    mockService.getProducts.mockResolvedValue(MOCK_PRODUCT_LIST as never);

    const req = createRequest(
      'http://localhost/api/products?page=2&limit=5&minPrice=100000&maxPrice=500000&island=Jawa&clothingType=batik&gender=male&inStock=true&sortBy=price_desc',
    );
    await GET(req, { params: Promise.resolve({}) });

    expect(mockService.getProducts).toHaveBeenCalledWith(2, 5, {
      minPrice: 100000,
      maxPrice: 500000,
      island: 'Jawa',
      size: undefined,
      clothingType: 'batik',
      topic: undefined,
      gender: 'male',
      inStock: true,
      excludeOutOfStock: true,
      sortBy: 'price_desc',
    });
  });
});
