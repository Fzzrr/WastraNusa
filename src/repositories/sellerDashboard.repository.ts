import prisma from '@/lib/prisma';

/**
 * Read-only repository for the seller sales dashboard.
 *
 * Self-contained (does not reuse the shared order repository) so seller
 * dashboard aggregation can evolve independently. Every query is scoped by
 * `sellerId` so a seller only ever sees their own sales.
 */
export const sellerDashboardRepository = {
  /**
   * Paid orders for a seller whose payment landed within [start, end).
   *
   * Keyed off `paidAt` (not `createdAt`) so revenue reflects when money
   * actually came in — matching the admin GMV basis (`Order.totalAmount`).
   */
  findPaidOrdersBetween: async (sellerId: string, start: Date, end: Date) => {
    return prisma.order.findMany({
      where: {
        sellerId,
        paymentStatus: 'paid',
        paidAt: { gte: start, lt: end },
      },
      select: {
        id: true,
        totalAmount: true,
        quantity: true,
        paidAt: true,
        productId: true,
        productName: true,
        product: {
          select: {
            name: true,
            clothingType: true,
          },
        },
      },
      orderBy: { paidAt: 'asc' },
    });
  },
};
