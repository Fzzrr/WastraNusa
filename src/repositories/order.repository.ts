import type { PaymentStatus, Prisma } from '@/generated/prisma/client';
import { ApiError } from '@/lib/error';
import prisma from '@/lib/prisma';

export const orderItemSelect = {
  productId: true,
  variantId: true,
  productName: true,
  variantName: true,
  quantity: true,
  unitPrice: true,
  imageURL: true,
  province: true,
  clothingType: true,
} satisfies Prisma.OrderItemSelect;

const paymentTransactionsSelect = {
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
} satisfies Prisma.Order$paymentTransactionsArgs;

const shippingAddressSelect = {
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
} satisfies Prisma.CustomerAddressDefaultArgs;

/** Shape of an order in the seller's order management view. */
export const managedOrderSelect = {
  id: true,
  orderNumber: true,
  courier: true,
  courierService: true,
  shippingAddress: shippingAddressSelect,
  totalAmount: true,
  orderStatus: true,
  paymentStatus: true,
  trackingNumber: true,
  createdAt: true,
  customerNotes: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: { select: orderItemSelect },
} satisfies Prisma.OrderSelect;

export type OrderItemCreate = Omit<Prisma.OrderItemCreateManyOrderInput, 'id'>;

export const orderRepository = {
  /**
   * Creates the order with its items and reserves variant stock in one
   * transaction. Each decrement only matches while `stock >= quantity`, so two
   * buyers racing for the last unit can't both succeed; a miss rolls the whole
   * checkout back.
   */
  createOrderAndReserveStock: async (
    data: Prisma.OrderUncheckedCreateInput,
    items: OrderItemCreate[],
  ) => {
    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item.variantId) continue;
        const { count } = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw new ApiError('Stok tidak mencukupi, silakan muat ulang', 409);
        }
      }

      return tx.order.create({
        data: {
          ...data,
          items: {
            createMany: {
              data: items.map((item) => ({
                ...item,
                id: crypto.randomUUID(),
              })),
            },
          },
        },
      });
    });
  },

  findOrderById: async (orderId: string, userId?: string) => {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        ...(userId ? { userId } : {}),
      },
      include: { items: { select: orderItemSelect } },
    });
  },

  findOrderDetailByIdentifier: async (userId: string, identifier: string) => {
    return prisma.order.findFirst({
      where: {
        userId,
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      select: {
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
        courier: true,
        courierService: true,
        trackingNumber: true,
        estimatedDelivery: true,
        customerNotes: true,
        shippingAddress: shippingAddressSelect,
        paymentTransactions: paymentTransactionsSelect,
        items: { select: orderItemSelect },
      },
    });
  },

  findOrderForUserByIdentifier: async (userId: string, identifier: string) => {
    return prisma.order.findFirst({
      where: {
        userId,
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      include: { paymentTransactions: paymentTransactionsSelect },
    });
  },

  findOrderForCancellationById: async (orderId: string) => {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { paymentTransactions: paymentTransactionsSelect },
    });
  },

  updateOrderPaymentStatus: async (
    orderId: string,
    data: {
      paymentStatus: PaymentStatus;
      paymentMethod?: string | null;
      paidAt?: Date | null;
    },
  ) => {
    return prisma.order.update({
      where: { id: orderId },
      data,
    });
  },

  /**
   * Marks a pending order paid and counts its items as sold. The guarded
   * update means Midtrans retries (and capture → settlement) only count once.
   */
  confirmPaidOrder: async (
    orderId: string,
    data: { paymentMethod: string; paidAt: Date | null },
  ) => {
    return prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, orderStatus: 'pending', paymentStatus: 'unpaid' },
        data: { ...data, paymentStatus: 'paid', orderStatus: 'confirmed' },
      });
      if (result.count === 0) return result;

      const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, quantity: true },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { sold: { increment: item.quantity } },
        });
      }
      return result;
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
        paymentTransactions: paymentTransactionsSelect,
        items: { select: orderItemSelect },
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
      include: { paymentTransactions: paymentTransactionsSelect },
    });
  },

  /**
   * Cancels a pending order and puts its reserved stock back. Only one caller
   * can win the guarded update, so stock is restored only once. Returns
   * whether this call did the cancellation.
   */
  cancelOrderAndRestoreStock: async (
    orderId: string,
    paymentTransactionStatus: 'failed' | 'expired',
    expiredAt?: Date,
  ) => {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: orderId, orderStatus: 'pending', paymentStatus: 'unpaid' },
        data: {
          orderStatus: 'cancelled',
          paymentStatus: 'failed',
        },
      });
      if (count === 0) return false;

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

      const items = await tx.orderItem.findMany({
        where: { orderId, variantId: { not: null } },
        select: { variantId: true, quantity: true },
      });
      for (const item of items) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId! },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
      return true;
    });
  },
};
