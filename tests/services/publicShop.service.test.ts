import { productRepository } from '@/repositories/product.repository';
import { shopProfileRepository } from '@/repositories/shopProfile.repository';
import { publicShopService } from '@/services/publicShop.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/shopProfile.repository', () => ({
  shopProfileRepository: {
    findPublicByUserId: vi.fn(),
  },
}));

vi.mock('@/repositories/product.repository', () => ({
  productRepository: {
    findActiveBySeller: vi.fn(),
  },
}));

// The global test setup (tests/setup.ts) auto-mocks @/services/product.service
// and omits the `mapProduct` export that publicShopService relies on. Restore
// the real module here so the mapping is exercised end-to-end.
vi.mock('@/services/product.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/product.service')>();
  return actual;
});

const mockShopRepo = vi.mocked(shopProfileRepository);
const mockProductRepo = vi.mocked(productRepository);

const SELLER_ID = 'seller-1';

const decimal = (value: number) => ({ toNumber: () => value });

const buildProfile = () => ({
  id: 'shop-1',
  userId: SELLER_ID,
  shopName: 'Batik Nusantara',
  description: 'Toko batik',
  phoneNumber: '08123456789',
  email: 'shop@example.com',
  address: 'Jl. Mawar 1',
  city: 'Yogyakarta',
  province: 'DIY',
  logoURL: 'https://example.com/logo.png',
  createdAt: new Date('2024-01-02T03:04:05.000Z'),
  updatedAt: new Date('2024-02-02T03:04:05.000Z'),
  user: { id: SELLER_ID, name: 'Pak Seller' },
});

const buildProduct = (id: string) => ({
  id,
  articleId: 'article-1',
  article: { id: 'article-1', title: 'Batik Parang' },
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: 'desc',
  price: decimal(150000),
  sku: `SKU-${id}`,
  weight: 500,
  imageURL: null,
  island: 'Jawa',
  province: 'DIY',
  clothingType: 'batik',
  gender: null,
  status: 'active',
  sold: 3,
  variants: [
    {
      id: `${id}-v1`,
      name: 'M',
      type: 'size',
      price: decimal(150000),
      stock: 5,
      sku: `SKU-${id}-M`,
      imageURL: null,
    },
  ],
  createdAt: new Date('2024-03-01T00:00:00.000Z'),
  updatedAt: new Date('2024-03-02T00:00:00.000Z'),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('publicShopService.getPublicShop', { tags: ['backend'] }, () => {
  it('404s when no shop profile exists for the seller', async () => {
    mockShopRepo.findPublicByUserId.mockResolvedValue(null as never);

    await expect(
      publicShopService.getPublicShop(SELLER_ID),
    ).rejects.toMatchObject({ status: 404 });
    expect(mockProductRepo.findActiveBySeller).not.toHaveBeenCalled();
  });

  it('returns the shop profile, mapped products, and productCount', async () => {
    mockShopRepo.findPublicByUserId.mockResolvedValue(buildProfile() as never);
    mockProductRepo.findActiveBySeller.mockResolvedValue([
      buildProduct('p1'),
      buildProduct('p2'),
    ] as never);

    const result = await publicShopService.getPublicShop(SELLER_ID);

    expect(mockShopRepo.findPublicByUserId).toHaveBeenCalledWith(SELLER_ID);
    expect(mockProductRepo.findActiveBySeller).toHaveBeenCalledWith(SELLER_ID);

    expect(result.shop).toEqual({
      sellerId: SELLER_ID,
      shopName: 'Batik Nusantara',
      description: 'Toko batik',
      phoneNumber: '08123456789',
      email: 'shop@example.com',
      address: 'Jl. Mawar 1',
      city: 'Yogyakarta',
      province: 'DIY',
      logoURL: 'https://example.com/logo.png',
      sellerName: 'Pak Seller',
      joinedAt: '2024-01-02T03:04:05.000Z',
    });

    expect(result.productCount).toBe(2);
    expect(result.products).toHaveLength(2);
    expect(result.products[0]).toMatchObject({
      id: 'p1',
      name: 'Product p1',
      price: 150000,
      stock: 5,
      variantCount: 1,
      seller: null,
    });
  });

  it('returns an empty product list with zero count when the seller has none', async () => {
    mockShopRepo.findPublicByUserId.mockResolvedValue(buildProfile() as never);
    mockProductRepo.findActiveBySeller.mockResolvedValue([] as never);

    const result = await publicShopService.getPublicShop(SELLER_ID);

    expect(result.products).toEqual([]);
    expect(result.productCount).toBe(0);
  });
});
