import { ROLES } from '@/lib/auth/roles';
import { ApiError } from '@/lib/error';
import { lookupCities } from '@/lib/ip-geolocation';
import { logger } from '@/lib/logger';
import {
  type SellerManagementRoleFilter,
  type SellerManagementSort,
  sellerManagementRepository,
} from '@/repositories/sellerManagement.repository';

const MONTH_LABELS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];
const WINDOW_MONTHS = 8;

type Metric = {
  current: number;
  /** Change vs the previous month, or null when there's nothing to compare. */
  changePercent: number | null;
  /** One value per month in `months` (oldest → newest). */
  series: number[];
};

export type SellerManagementStats = {
  months: string[];
  verifiedSellers: { total: number; newThisMonth: number; series: number[] };
  /** Paid GMV per month. */
  monthlySales: Metric;
  /** Rolling 12-month paid GMV at the end of each month. */
  annualRevenue: Metric;
  /** Number of paid orders per month. */
  orders: Metric;
};

export type SellerManagementUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'user' | 'seller';
  location: string | null;
  /** `ip`: approximated from the latest login; `address`: shipping address. */
  locationSource: 'ip' | 'address' | null;
  application: {
    id: string;
    shopName: string;
    description: string | null;
    phoneNumber: string | null;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason: string | null;
  } | null;
};

// Months as a single increasing integer so ranges don't care about years.
const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const monthStart = (key: number) => new Date(Math.floor(key / 12), key % 12, 1);

function changePercent(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

function metric(series: number[]): Metric {
  const current = series[series.length - 1];
  return {
    current,
    changePercent: changePercent(current, series[series.length - 2]),
    series,
  };
}

export const sellerManagementService = {
  getStats: async (now: Date = new Date()): Promise<SellerManagementStats> => {
    const currentKey = monthKey(now);
    const windowKeys = Array.from(
      { length: WINDOW_MONTHS },
      (_, i) => currentKey - (WINDOW_MONTHS - 1) + i,
    );
    // Rolling 12-month revenue for the first window month reaches back 11 more.
    const earliestKey = windowKeys[0] - 11;

    const [orders, approvals] = await Promise.all([
      sellerManagementRepository.findPaidOrdersSince(monthStart(earliestKey)),
      sellerManagementRepository.findApprovedApplicationDates(),
    ]);

    const gmvByMonth = new Map<number, number>();
    const ordersByMonth = new Map<number, number>();
    for (const order of orders) {
      if (!order.paidAt) continue;
      const key = monthKey(order.paidAt);
      gmvByMonth.set(
        key,
        (gmvByMonth.get(key) ?? 0) + Number(order.totalAmount),
      );
      ordersByMonth.set(key, (ordersByMonth.get(key) ?? 0) + 1);
    }

    const approvalKeys = approvals
      .map((approval) => approval.reviewedAt)
      .filter((date): date is Date => date !== null)
      .map(monthKey);

    const rolling12 = (key: number) =>
      Array.from({ length: 12 }, (_, i) => gmvByMonth.get(key - i) ?? 0).reduce(
        (sum, value) => sum + value,
        0,
      );

    return {
      months: windowKeys.map((key) => MONTH_LABELS_ID[key % 12]),
      verifiedSellers: {
        total: approvalKeys.length,
        newThisMonth: approvalKeys.filter((key) => key === currentKey).length,
        series: windowKeys.map(
          (key) =>
            approvalKeys.filter((approvalKey) => approvalKey <= key).length,
        ),
      },
      monthlySales: metric(windowKeys.map((key) => gmvByMonth.get(key) ?? 0)),
      annualRevenue: metric(windowKeys.map(rolling12)),
      orders: metric(windowKeys.map((key) => ordersByMonth.get(key) ?? 0)),
    };
  },

  demoteSeller: async (userId: string, reviewerId: string, reason: string) => {
    const user = await sellerManagementRepository.findUserRole(userId);
    if (!user) {
      throw new ApiError('User tidak ditemukan', 404);
    }
    if (user.role !== ROLES.SELLER) {
      throw new ApiError('User ini bukan seller', 400);
    }

    await sellerManagementRepository.demoteSeller(userId, reviewerId, reason);
    logger.info('Seller demoted to user', { userId, reviewerId });
  },

  getUsers: async (filters: {
    search?: string;
    role?: SellerManagementRoleFilter;
    sort?: SellerManagementSort;
  }): Promise<SellerManagementUser[]> => {
    const users = await sellerManagementRepository.findUsers(filters);
    const citiesByIp = await lookupCities(
      users.map((user) => user.sessions[0]?.ipAddress),
    );

    return users.map((user) => {
      const ip = user.sessions[0]?.ipAddress;
      const ipCity = ip ? citiesByIp.get(ip) : null;
      const addressCity = user.customerAddresses[0]?.city ?? null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role === ROLES.SELLER ? 'seller' : 'user',
        location: ipCity ?? addressCity,
        locationSource: ipCity ? 'ip' : addressCity ? 'address' : null,
        application: user.sellerApplication,
      };
    });
  },
};
