import { COMMISSION_RATE } from '@/lib/constants';
import { sellerDashboardRepository } from '@/repositories/sellerDashboard.repository';

export type SellerDashboardPeriod = 7 | 30 | 90;

export type SellerDashboardData = {
  period: SellerDashboardPeriod;
  stats: {
    /** Seller net revenue = gross GMV * (1 - COMMISSION_RATE). */
    netRevenue: number;
    /** Number of paid orders in the period. */
    totalOrders: number;
    /** Average order value (gross GMV / paid orders). */
    averageOrderValue: number;
    /** Admin commission = gross GMV * COMMISSION_RATE. */
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
    /** Seller net revenue for this product (gross * (1 - COMMISSION_RATE)). */
    revenue: number;
    /** Admin commission for this product (gross * COMMISSION_RATE). */
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

function toGross(totalAmount: { toNumber(): number } | number): number {
  return typeof totalAmount === 'number' ? totalAmount : totalAmount.toNumber();
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
    const weeklyGross = new Array<number>(bucketCount).fill(0);

    let gross = 0;
    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        category: string;
        unitsSold: number;
        gross: number;
        weeklyGross: number[];
      }
    >();

    for (const order of orders) {
      const orderGross = toGross(order.totalAmount);
      gross += orderGross;

      const paidAt = order.paidAt ?? now;
      const dayOffset = Math.floor(
        (startOfDay(new Date(paidAt)).getTime() - start.getTime()) / DAY_MS,
      );
      const bucketIndex = Math.min(
        bucketCount - 1,
        Math.max(0, Math.floor(dayOffset / 7)),
      );
      weeklyGross[bucketIndex] += orderGross;

      const key = order.productId;
      const existing = productMap.get(key);
      if (existing) {
        existing.unitsSold += order.quantity;
        existing.gross += orderGross;
        existing.weeklyGross[bucketIndex] += orderGross;
      } else {
        const weekly = new Array<number>(bucketCount).fill(0);
        weekly[bucketIndex] += orderGross;
        productMap.set(key, {
          productId: order.productId,
          name: order.productName || order.product?.name || 'Produk',
          category: order.product?.clothingType ?? '-',
          unitsSold: order.quantity,
          gross: orderGross,
          weeklyGross: weekly,
        });
      }
    }

    const totalOrders = orders.length;
    const netRevenue = gross * (1 - COMMISSION_RATE);
    const adminCommission = gross * COMMISSION_RATE;
    const averageOrderValue = totalOrders > 0 ? gross / totalOrders : 0;

    const weeklyRevenue = weeklyGross.map((value, index) => ({
      label: `Mgg ${index + 1}`,
      // Net revenue per week, consistent with the "Total Pendapatan" card.
      value: value * (1 - COMMISSION_RATE),
    }));

    const products = Array.from(productMap.values())
      .map((product) => ({
        productId: product.productId,
        name: product.name,
        category: product.category,
        unitsSold: product.unitsSold,
        revenue: product.gross * (1 - COMMISSION_RATE),
        commission: product.gross * COMMISSION_RATE,
        trend: product.weeklyGross.map(
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
