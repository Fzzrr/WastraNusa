import { Prisma } from '@/generated/prisma/client';
import { ROLES } from '@/lib/auth/roles';
import prisma from '@/lib/prisma';

export type SellerManagementRoleFilter =
  | 'user'
  | 'seller'
  | 'pending'
  | 'rejected';
export type SellerManagementSort = 'newest' | 'oldest' | 'name';

const SORT_ORDER: Record<
  SellerManagementSort,
  Prisma.UserOrderByWithRelationInput
> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  name: { name: 'asc' },
};

export const sellerManagementRepository = {
  /** Paid orders (amount + payment time) paid on or after `since`. */
  findPaidOrdersSince: async (since: Date) => {
    return prisma.order.findMany({
      where: { paymentStatus: 'paid', paidAt: { gte: since } },
      select: { paidAt: true, totalAmount: true },
    });
  },

  /** Approval times of every approved seller application. */
  findApprovedApplicationDates: async () => {
    return prisma.sellerApplication.findMany({
      where: { status: 'approved', reviewedAt: { not: null } },
      select: { reviewedAt: true },
    });
  },

  findUserRole: async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
  },

  /**
   * Revokes seller status in one transaction: role back to user, the approved
   * application is marked rejected (so they may re-apply and it stops counting
   * as verified), and their sessions are dropped so the cached role can't linger.
   */
  demoteSeller: async (userId: string, reviewerId: string, reason: string) => {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: ROLES.USER },
      }),
      prisma.sellerApplication.updateMany({
        where: { userId, status: 'approved' },
        data: {
          status: 'rejected',
          rejectionReason: reason,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      }),
      prisma.session.deleteMany({ where: { userId } }),
    ]);
  },

  // ponytail: capped list without pagination; add cursor paging when the
  // user base outgrows a single screen.
  findUsers: async ({
    search,
    role,
    sort = 'newest',
    limit = 100,
  }: {
    search?: string;
    role?: SellerManagementRoleFilter;
    sort?: SellerManagementSort;
    limit?: number;
  }) => {
    const and: Prisma.UserWhereInput[] = [
      { OR: [{ role: null }, { role: { not: ROLES.ADMIN } }] },
    ];

    if (search) {
      and.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          {
            sellerApplication: {
              shopName: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      });
    }

    if (role === 'seller') {
      and.push({ role: ROLES.SELLER });
    } else if (role === 'user') {
      and.push({ OR: [{ role: null }, { role: { not: ROLES.SELLER } }] });
    } else if (role === 'pending') {
      and.push({ sellerApplication: { status: 'pending' } });
    } else if (role === 'rejected') {
      and.push({ sellerApplication: { status: 'rejected' } });
    }

    return prisma.user.findMany({
      where: { AND: and },
      take: limit,
      orderBy: SORT_ORDER[sort],
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        sellerApplication: {
          select: {
            id: true,
            shopName: true,
            description: true,
            phoneNumber: true,
            status: true,
            rejectionReason: true,
          },
        },
        customerAddresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
          take: 1,
          select: { city: true },
        },
        sessions: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          select: { ipAddress: true },
        },
      },
    });
  },
};
