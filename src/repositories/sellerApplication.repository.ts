import { Prisma, SellerApplicationStatus } from '@/generated/prisma/client';
import { ROLES } from '@/lib/auth/roles';
import prisma from '@/lib/prisma';

export const sellerApplicationRepository = {
  findByUser: async (userId: string) => {
    return prisma.sellerApplication.findUnique({
      where: { userId },
    });
  },

  findById: async (id: string) => {
    return prisma.sellerApplication.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  findAll: async (status?: SellerApplicationStatus) => {
    return prisma.sellerApplication.findMany({
      where: status ? { status } : {},
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  countByStatus: async (status: SellerApplicationStatus) => {
    return prisma.sellerApplication.count({ where: { status } });
  },

  create: async (data: Prisma.SellerApplicationUncheckedCreateInput) => {
    return prisma.sellerApplication.create({ data });
  },

  update: async (
    id: string,
    data: Prisma.SellerApplicationUncheckedUpdateInput,
  ) => {
    return prisma.sellerApplication.update({ where: { id }, data });
  },

  /**
   * Approves an application and promotes the applicant to the seller role in a
   * single transaction, so the role change and status change never diverge.
   */
  approveAndPromote: async (
    id: string,
    userId: string,
    reviewedById: string,
  ) => {
    const [application] = await prisma.$transaction([
      prisma.sellerApplication.update({
        where: { id },
        data: {
          status: SellerApplicationStatus.approved,
          rejectionReason: null,
          reviewedById,
          reviewedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: ROLES.SELLER },
      }),
    ]);

    return application;
  },
};
