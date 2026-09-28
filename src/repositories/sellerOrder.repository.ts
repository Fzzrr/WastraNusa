import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

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
      select: {
        id: true,
        orderNumber: true,
        quantity: true,
        totalAmount: true,
        subtotal: true,
        shippingCost: true,
        orderStatus: true,
        paymentStatus: true,
        trackingNumber: true,
        createdAt: true,
        customerNotes: true,
        productId: true,
        variantId: true,
        productPrice: true,
        productName: true,
        variantName: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            province: true,
            clothingType: true,
            imageURL: true,
          },
        },
      },
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
      select: {
        id: true,
        orderNumber: true,
        quantity: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        trackingNumber: true,
        createdAt: true,
        customerNotes: true,
        productId: true,
        variantId: true,
        productPrice: true,
        productName: true,
        variantName: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            province: true,
            clothingType: true,
            imageURL: true,
          },
        },
      },
    });
  },

  updateOrderForSeller: async (
    orderId: string,
    data: Prisma.OrderUpdateInput,
  ) => {
    return prisma.order.update({
      where: { id: orderId },
      data,
      select: {
        id: true,
        orderNumber: true,
        quantity: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        trackingNumber: true,
        createdAt: true,
        customerNotes: true,
        productId: true,
        variantId: true,
        productPrice: true,
        productName: true,
        variantName: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            province: true,
            clothingType: true,
            imageURL: true,
          },
        },
      },
    });
  },

  findProductDetailsForOrder: async (productId: string) => {
    return prisma.product.findFirst({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        province: true,
        clothingType: true,
        imageURL: true,
      },
    });
  },
};
