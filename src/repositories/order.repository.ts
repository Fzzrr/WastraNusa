import type { PaymentStatus, Prisma } from '@/generated/prisma/client';
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
      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'cancelled',
          paymentStatus: 'failed',
        },
      });

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
        await tx.productVariant.update({
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
