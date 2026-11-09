import type { PaymentStatus, Prisma } from '@/generated/prisma/client';
import { ApiError } from '@/lib/error';
import prisma from '@/lib/prisma';

const userOrderRelations = {
  product: {
    select: {
      id: true,
      name: true,
      province: true,
      clothingType: true,
      imageURL: true,
    },
  },
  shippingAddress: {
    select: {
      recipientName: true,
      phone: true,
      province: true,
      city: true,
      district: true,
      subdistrict: true,
      postalCode: true,
      fullAddress: true,
    },
  },
  paymentTransactions: {
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      status: true,
      paymentUrl: true,
      vaNumber: true,
      paidAt: true,
      expiredAt: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

export const orderRepository = {
  createOrder: async (data: Prisma.OrderUncheckedCreateInput) => {
    return prisma.order.create({ data });
  },

  /**
   * Creates the order and reserves variant stock in one transaction. Each
   * decrement only matches while `stock >= quantity`, so two buyers racing for
   * the last unit can't both succeed; a miss rolls the whole checkout back.
   */
  createOrderAndReserveStock: async (
    data: Prisma.OrderUncheckedCreateInput,
    reservations: Array<{ variantId: string; quantity: number }>,
  ) => {
    return prisma.$transaction(async (tx) => {
      for (const item of reservations) {
        const { count } = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw new ApiError('Stok tidak mencukupi, silakan muat ulang', 409);
        }
      }

      return tx.order.create({ data });
    });
  },

  findOrderById: async (orderId: string, userId?: string) => {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        ...(userId ? { userId } : {}),
      },
    });
  },

  findOrderDetailByIdentifier: async (userId: string, identifier: string) => {
    return prisma.order.findFirst({
      where: {
        userId,
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      select: {
        ...userOrderRelations,
        id: true,
        orderNumber: true,
        createdAt: true,
        totalAmount: true,
        subtotal: true,
        shippingCost: true,
        serviceFee: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        quantity: true,
        productId: true,
        variantId: true,
        productPrice: true,
        courier: true,
        courierService: true,
        trackingNumber: true,
        estimatedDelivery: true,
        customerNotes: true,
      },
    });
  },

  findOrderForUserByIdentifier: async (userId: string, identifier: string) => {
    return prisma.order.findFirst({
      where: {
        userId,
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      include: userOrderRelations,
    });
  },

  findOrderForCancellationById: async (orderId: string) => {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        paymentTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            status: true,
            expiredAt: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    });
  },

  updateOrderPaymentStatus: async (
    orderId: string,
    data: {
      paymentStatus: PaymentStatus;
      paymentMethod?: string | null;
      paidAt?: Date | null;
      orderStatus?: 'confirmed';
    },
  ) => {
    return prisma.order.update({
      where: { id: orderId },
      data,
    });
  },

  confirmPaidOrder: async (
    orderId: string,
    data: { paymentMethod: string; paidAt: Date | null },
  ) => {
    return prisma.order.updateMany({
      where: { id: orderId, orderStatus: 'pending', paymentStatus: 'unpaid' },
      data: { ...data, paymentStatus: 'paid', orderStatus: 'confirmed' },
    });
  },

  findOrdersByUserId: async (
    userId: string,
    filters: Prisma.OrderWhereInput,
    skip?: number,
    take?: number,
  ) => {
    return prisma.order.findMany({
      where: { userId, ...filters },
      skip,
      take,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        quantity: true,
        productId: true,
        variantId: true,
        customerNotes: true,
        product: {
          select: {
            name: true,
            province: true,
            clothingType: true,
            imageURL: true,
          },
        },
        paymentTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            status: true,
            expiredAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  countOrdersByUserId: async (
    userId: string,
    filters: Prisma.OrderWhereInput,
  ) => {
    return prisma.order.count({
      where: { userId, ...filters },
    });
  },

  findExpiredPendingOrders: async (now: Date, userId?: string) => {
    return prisma.order.findMany({
      where: {
        ...(userId ? { userId } : {}),
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        paymentTransactions: {
          some: {
            status: 'pending',
            expiredAt: {
              lte: now,
            },
          },
        },
      },
      include: {
        paymentTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            status: true,
            expiredAt: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    });
  },

  cancelOrder: async (orderId: string, data?: Prisma.OrderUpdateInput) => {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'cancelled',
        paymentStatus: 'failed',
        ...data,
      },
    });
  },

  cancelOrderAndRestoreStock: async (
    orderId: string,
    restoredVariantItems: Array<{
      variantId: string;
      quantity: number;
    }>,
    paymentTransactionStatus: 'failed' | 'expired',
    expiredAt?: Date,
  ) => {
    return prisma.$transaction(async (tx) => {
      // Only one caller can win this update, so stock is restored only once.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, orderStatus: 'pending', paymentStatus: 'unpaid' },
        data: {
          orderStatus: 'cancelled',
          paymentStatus: 'failed',
        },
      });
      if (count === 0) return;

      await tx.paymentTransaction.updateMany({
        where: {
          orderId,
          status: 'pending',
        },
        data: {
          status: paymentTransactionStatus,
          expiredAt,
        },
      });

      for (const item of restoredVariantItems) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    });
  },

  findOrdersForAdmin: async (
    filters: Prisma.OrderWhereInput,
    skip?: number,
    take?: number,
  ) => {
    return prisma.order.findMany({
      where: filters,
      skip,
      take,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  countOrdersForAdmin: async (filters: Prisma.OrderWhereInput) => {
    return prisma.order.count({
      where: filters,
    });
  },

  findOrderForAdminByIdentifier: async (identifier: string) => {
    return prisma.order.findFirst({
      where: {
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
        shippingAddress: {
          select: {
            recipientName: true,
            phone: true,
            province: true,
            city: true,
            district: true,
            subdistrict: true,
            postalCode: true,
            fullAddress: true,
          },
        },
      },
    });
  },

  updateOrderForAdmin: async (
    identifier: string,
    data: Prisma.OrderUpdateInput,
  ) => {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      select: {
        id: true,
      },
    });

    return prisma.order.update({
      where: {
        id: order?.id ?? identifier,
      },
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
