import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { managedOrderSelect } from '@/repositories/order.repository';

/**
 * Data access for orders that belong to a specific seller. Every query is
 * scoped by `sellerId` so a seller can only ever see or mutate their own
 * orders.
 */
export const sellerOrderRepository = {
  findOrdersBySeller: async (
    sellerId: string,
    filters: Prisma.OrderWhereInput,
    skip?: number,
    take?: number,
  ) => {
    return prisma.order.findMany({
      where: { sellerId, ...filters },
      skip,
      take,
      select: managedOrderSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  countOrdersBySeller: async (
    sellerId: string,
    filters: Prisma.OrderWhereInput,
  ) => {
    return prisma.order.count({
      where: { sellerId, ...filters },
    });
  },

  findOrderForSellerByIdentifier: async (
    sellerId: string,
    identifier: string,
  ) => {
    return prisma.order.findFirst({
      where: {
        sellerId,
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      select: managedOrderSelect,
    });
  },

  updateOrderForSeller: async (
    orderId: string,
    data: Prisma.OrderUpdateInput,
  ) => {
    return prisma.order.update({
      where: { id: orderId },
      data,
      select: managedOrderSelect,
    });
  },
};
