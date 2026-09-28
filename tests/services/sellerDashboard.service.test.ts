import { COMMISSION_RATE } from '@/lib/constants';
import { sellerDashboardRepository } from '@/repositories/sellerDashboard.repository';
import { sellerDashboardService } from '@/services/sellerDashboard.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/sellerDashboard.repository', () => ({
  sellerDashboardRepository: {
    findPaidOrdersBetween: vi.fn(),
  },
}));

const mockRepo = vi.mocked(sellerDashboardRepository);
const SELLER_ID = 'seller-1';

function paidOrder(overrides: Record<string, unknown>) {
  return {
    productId: 'p1',
    productName: 'Batik',
    quantity: 1,
    totalAmount: 200_000,
    paidAt: new Date(),
    product: { name: 'Batik', clothingType: 'batik' },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe(
  'sellerDashboardService commission math',
  { tags: ['backend'] },
  () => {
    it('splits gross GMV into net revenue and admin commission', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([
        paidOrder({ productId: 'p1', totalAmount: 200_000, quantity: 1 }),
        paidOrder({ productId: 'p1', totalAmount: 300_000, quantity: 2 }),
        paidOrder({
          productId: 'p2',
          totalAmount: 500_000,
          quantity: 1,
          product: { name: 'Songket', clothingType: 'songket' },
        }),
      ] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);

      const gross = 1_000_000;
      expect(result.stats.netRevenue).toBe(gross * (1 - COMMISSION_RATE));
      expect(result.stats.adminCommission).toBe(gross * COMMISSION_RATE);
      expect(result.stats.totalOrders).toBe(3);
      expect(result.stats.averageOrderValue).toBeCloseTo(gross / 3, 5);
      expect(result.stats.netRevenue + result.stats.adminCommission).toBe(
        gross,
      );
    });

    it('aggregates per-product net revenue, commission, and units sold', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([
        paidOrder({ productId: 'p1', totalAmount: 200_000, quantity: 1 }),
        paidOrder({ productId: 'p1', totalAmount: 300_000, quantity: 2 }),
      ] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);

      const p1 = result.products.find((p) => p.productId === 'p1');
      expect(p1).toBeDefined();
      expect(p1?.unitsSold).toBe(3);
      expect(p1?.revenue).toBe(500_000 * (1 - COMMISSION_RATE));
      expect(p1?.commission).toBe(500_000 * COMMISSION_RATE);
    });

    it('handles a seller with no paid orders', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);

      expect(result.stats.netRevenue).toBe(0);
      expect(result.stats.adminCommission).toBe(0);
      expect(result.stats.totalOrders).toBe(0);
      expect(result.stats.averageOrderValue).toBe(0);
      expect(result.products).toEqual([]);
    });

    it('accepts Prisma Decimal-like totalAmount values', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([
        paidOrder({ totalAmount: { toNumber: () => 400_000 } }),
      ] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);

      expect(result.stats.netRevenue).toBe(400_000 * (1 - COMMISSION_RATE));
    });

    it('clamps an invalid period to the 30-day default', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID, 999);

      expect(result.period).toBe(30);
    });
  },
);
