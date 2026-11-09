import type { Prisma } from '@/generated/prisma/client';
import type { OrderStatus, PaymentStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { sellerOrderRepository } from '@/repositories/sellerOrder.repository';
import {
  buildFulfilmentUpdate,
  mapManagedOrder,
  reconcileExpiredOrders,
} from '@/services/order.service';

/**
 * Business logic for a seller managing the orders placed for THEIR products.
 * `sellerId` is the authenticated seller's user id (from `withApiSeller`); it
 * scopes every read and is enforced before every mutation.
 */
export const sellerOrderService = {
  getSellerOrders: async (
    sellerId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ) => {
    await reconcileExpiredOrders();

    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const where: Prisma.OrderWhereInput = {};
    if (filters?.orderStatus) {
      where.orderStatus = filters.orderStatus;
    }
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    const [orders, totalItems] = await Promise.all([
      sellerOrderRepository.findOrdersBySeller(
        sellerId,
        where,
        offset,
        safeLimit,
      ),
      sellerOrderRepository.countOrdersBySeller(sellerId, where),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return {
      items: orders.map(mapManagedOrder),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
      },
    };
  },

  updateOrderForSeller: async (
    sellerId: string,
    identifier: string,
    data: {
      orderStatus?: OrderStatus;
      trackingNumber?: string | null;
    },
  ) => {
    const existing = await sellerOrderRepository.findOrderForSellerByIdentifier(
      sellerId,
      identifier,
    );

    if (!existing) {
      throw new ApiError('Pesanan tidak ditemukan', 404);
    }

    // Update by the resolved owned id so ownership is enforced.
    const updated = await sellerOrderRepository.updateOrderForSeller(
      existing.id,
      buildFulfilmentUpdate(existing, data),
    );

    logger.info('Seller order updated successfully', {
      orderId: existing.id,
      sellerId,
    });

    return mapManagedOrder(updated);
  },
};
