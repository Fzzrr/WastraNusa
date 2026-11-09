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

function paidOrder({
  productId = 'p1',
  quantity = 1,
  totalAmount = 200_000,
  product = { name: 'Batik', clothingType: 'batik' },
}: {
  productId?: string;
  quantity?: number;
  totalAmount?: number;
  product?: { name: string; clothingType: string };
}) {
  return {
    totalAmount,
    shippingCost: 0,
    paidAt: new Date(),
    items: [
      {
        productId,
        productName: product.name,
        clothingType: product.clothingType,
        quantity,
        unitPrice: totalAmount / quantity,
      },
    ],
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
        {
          ...paidOrder({}),
          totalAmount: { toNumber: () => 400_000 },
          shippingCost: { toNumber: () => 0 },
          items: [
            {
              productId: 'p1',
              productName: 'Batik',
              clothingType: 'batik',
              quantity: 1,
              unitPrice: { toNumber: () => 400_000 },
            },
          ],
        },
      ] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);

      expect(result.stats.netRevenue).toBe(400_000 * (1 - COMMISSION_RATE));
    });

    it('clamps an invalid period to the 30-day default', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID, 999);

      expect(result.period).toBe(30);
    });

    it('splits a multi-product order across its products', async () => {
      mockRepo.findPaidOrdersBetween.mockResolvedValue([
        {
          totalAmount: 400_000,
          shippingCost: 0,
          paidAt: new Date(),
          items: [
            {
              productId: 'p1',
              productName: 'Batik',
              clothingType: 'batik',
              quantity: 1,
              unitPrice: 100_000,
            },
            {
              productId: 'p2',
              productName: 'Songket',
              clothingType: 'songket',
              quantity: 3,
              unitPrice: 100_000,
            },
          ],
        },
      ] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);
      const byId = Object.fromEntries(
        result.products.map((p) => [p.productId, p]),
      );

      expect(byId.p1.unitsSold).toBe(1);
      expect(byId.p2.unitsSold).toBe(3);
      expect(byId.p1.revenue).toBeCloseTo(100_000 * (1 - COMMISSION_RATE));
      expect(byId.p2.revenue).toBeCloseTo(300_000 * (1 - COMMISSION_RATE));
    });

    it('takes commission on item sales only and passes shipping to the seller', async () => {
      // 2 x 100.000 items + 18.000 shipping + 5.000 service fee.
      mockRepo.findPaidOrdersBetween.mockResolvedValue([
        {
          ...paidOrder({ quantity: 2, totalAmount: 200_000 }),
          totalAmount: 223_000,
          shippingCost: 18_000,
        },
      ] as never);

      const result = await sellerDashboardService.getOverview(SELLER_ID);

      expect(result.stats.adminCommission).toBe(30_000);
      // 200.000 - 30.000 commission + 18.000 shipping; the fee stays out.
      expect(result.stats.netRevenue).toBe(188_000);
      expect(result.stats.averageOrderValue).toBe(223_000);
      expect(result.products[0].revenue).toBe(170_000);
    });
  },
);
