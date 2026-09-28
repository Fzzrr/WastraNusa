import { sellerManagementRepository } from '@/repositories/sellerManagement.repository';
import { sellerManagementService } from '@/services/sellerManagement.service';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/sellerManagement.repository', () => ({
  sellerManagementRepository: {
    findPaidOrdersSince: vi.fn(),
    findApprovedApplicationDates: vi.fn(),
    findUsers: vi.fn(),
    findUserRole: vi.fn(),
    demoteSeller: vi.fn(),
  },
}));

const mockRepo = vi.mocked(sellerManagementRepository);

describe('sellerManagementService.getStats', { tags: ['backend'] }, () => {
  it('buckets paid orders and approvals into the last 8 months', async () => {
    mockRepo.findPaidOrdersSince.mockResolvedValue([
      // 11 months before the window: only counts toward rolling revenue.
      { paidAt: new Date(2025, 9, 5), totalAmount: 1_000_000 },
      { paidAt: new Date(2026, 7, 10), totalAmount: 2_000_000 },
      { paidAt: new Date(2026, 8, 3), totalAmount: 3_000_000 },
      { paidAt: new Date(2026, 8, 20), totalAmount: 1_000_000 },
    ] as never);
    mockRepo.findApprovedApplicationDates.mockResolvedValue([
      { reviewedAt: new Date(2026, 1, 1) },
      { reviewedAt: new Date(2026, 8, 2) },
    ]);

    const stats = await sellerManagementService.getStats(new Date(2026, 8, 24));

    expect(stats.months).toEqual([
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
    ]);
    expect(stats.monthlySales.series).toEqual([
      0, 0, 0, 0, 0, 0, 2_000_000, 4_000_000,
    ]);
    expect(stats.monthlySales.changePercent).toBe(100);
    expect(stats.orders.current).toBe(2);
    expect(stats.annualRevenue.series[0]).toBe(1_000_000);
    expect(stats.annualRevenue.current).toBe(7_000_000);
    expect(stats.verifiedSellers).toEqual({
      total: 2,
      newThisMonth: 1,
      series: [1, 1, 1, 1, 1, 1, 1, 2],
    });
  });
});

describe('sellerManagementService.demoteSeller', { tags: ['backend'] }, () => {
  it('demotes a seller', async () => {
    mockRepo.findUserRole.mockResolvedValue({ id: 'u1', role: 'seller' });

    await sellerManagementService.demoteSeller('u1', 'admin-1', 'Melanggar');

    expect(mockRepo.demoteSeller).toHaveBeenCalledWith(
      'u1',
      'admin-1',
      'Melanggar',
    );
  });

  it('refuses non-sellers and unknown users', async () => {
    mockRepo.demoteSeller.mockClear();
    mockRepo.findUserRole.mockResolvedValueOnce({ id: 'u2', role: 'admin' });
    await expect(
      sellerManagementService.demoteSeller('u2', 'admin-1', 'x'),
    ).rejects.toThrow('User ini bukan seller');

    mockRepo.findUserRole.mockResolvedValueOnce(null);
    await expect(
      sellerManagementService.demoteSeller('u3', 'admin-1', 'x'),
    ).rejects.toThrow('User tidak ditemukan');

    expect(mockRepo.demoteSeller).not.toHaveBeenCalled();
  });
});
