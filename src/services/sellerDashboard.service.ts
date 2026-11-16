import { COMMISSION_RATE } from '@/lib/constants';
import { sellerDashboardRepository } from '@/repositories/sellerDashboard.repository';

export type SellerDashboardPeriod = 7 | 30 | 90;

export type SellerDashboardData = {
  period: SellerDashboardPeriod;
  stats: {
    /** What the seller keeps: item sales - commission + shipping they pay out. */
    netRevenue: number;
    /** Number of paid orders in the period. */
    totalOrders: number;
    /** Average order value (what buyers paid / paid orders). */
    averageOrderValue: number;
    /** Admin commission = item sales * COMMISSION_RATE. */
    adminCommission: number;
  };
  /** Net revenue bucketed into consecutive 7-day windows (oldest → newest). */
  weeklyRevenue: Array<{ label: string; value: number }>;
  /** Per-product breakdown (net revenue desc). */
  products: Array<{
    productId: string;
    name: string;
    category: string;
    unitsSold: number;
    /** Item sales of this product after commission (shipping isn't per product). */
    revenue: number;
    /** Admin commission for this product (item sales * COMMISSION_RATE). */
    commission: number;
    /** Weekly net revenue series for the sparkline trend. */
    trend: number[];
  }>;
};

const VALID_PERIODS: SellerDashboardPeriod[] = [7, 30, 90];
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

type Money = { toNumber(): number } | number;

function toNumber(value: Money): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export const sellerDashboardService = {
  getOverview: async (
    sellerId: string,
    periodInput: number = 30,
  ): Promise<SellerDashboardData> => {
    const period: SellerDashboardPeriod = VALID_PERIODS.includes(
      periodInput as SellerDashboardPeriod,
    )
      ? (periodInput as SellerDashboardPeriod)
      : 30;

    const now = new Date();
    // Window covers `period` calendar days including today: [start, end).
    const todayStart = startOfDay(now);
    const start = new Date(todayStart);
    start.setDate(start.getDate() - (period - 1));
    const end = new Date(todayStart);
    end.setDate(end.getDate() + 1);

    const orders = await sellerDashboardRepository.findPaidOrdersBetween(
      sellerId,
      start,
      end,
    );

    // Consecutive 7-day buckets from `start`. Each order lands in the bucket
    // that contains its paidAt day.
    const bucketCount = Math.max(1, Math.ceil(period / 7));
    const weeklyNet = new Array<number>(bucketCount).fill(0);

    // Commission is taken on item sales only: shipping goes to the courier
    // (paid by the seller) and the service fee is the platform's own.
    let buyerPaid = 0;
    let netRevenue = 0;
    let adminCommission = 0;
    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        category: string;
        unitsSold: number;
        sales: number;
        weeklySales: number[];
      }
    >();

    for (const order of orders) {
      const paidAt = order.paidAt ?? now;
      const dayOffset = Math.floor(
        (startOfDay(new Date(paidAt)).getTime() - start.getTime()) / DAY_MS,
      );
      const bucketIndex = Math.min(
        bucketCount - 1,
        Math.max(0, Math.floor(dayOffset / 7)),
      );

      let itemSales = 0;
      for (const item of order.items) {
        const sales = toNumber(item.unitPrice) * item.quantity;
        itemSales += sales;

        const existing = productMap.get(item.productId);
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.sales += sales;
          existing.weeklySales[bucketIndex] += sales;
        } else {
          const weekly = new Array<number>(bucketCount).fill(0);
          weekly[bucketIndex] += sales;
          productMap.set(item.productId, {
            productId: item.productId,
            name: item.productName,
            category: item.clothingType,
            unitsSold: item.quantity,
            sales,
            weeklySales: weekly,
          });
        }
      }

      const commission = itemSales * COMMISSION_RATE;
      const orderNet = itemSales - commission + toNumber(order.shippingCost);
      buyerPaid += toNumber(order.totalAmount);
      adminCommission += commission;
      netRevenue += orderNet;
      weeklyNet[bucketIndex] += orderNet;
    }

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? buyerPaid / totalOrders : 0;

    const weeklyRevenue = weeklyNet.map((value, index) => ({
      label: `Mgg ${index + 1}`,
      // Net revenue per week, consistent with the "Total Pendapatan" card.
      value,
    }));

    const products = Array.from(productMap.values())
      .map((product) => ({
        productId: product.productId,
        name: product.name,
        category: product.category,
        unitsSold: product.unitsSold,
        revenue: product.sales * (1 - COMMISSION_RATE),
        commission: product.sales * COMMISSION_RATE,
        trend: product.weeklySales.map(
          (value) => value * (1 - COMMISSION_RATE),
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      period,
      stats: {
        netRevenue,
        totalOrders,
        averageOrderValue,
        adminCommission,
      },
      weeklyRevenue,
      products,
    };
  },
};
