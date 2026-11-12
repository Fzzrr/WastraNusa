import { ApiError } from '@/lib/error';
import {
  expireMidtransTransaction,
  getMidtransTransactionStatus,
} from '@/lib/midtrans';
import { orderRepository } from '@/repositories/order.repository';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/order.service');

const mockRepo = vi.mocked(orderRepository, true);

const ITEM = {
  productId: 'prod-1',
  variantId: null,
  productName: 'Batik',
  variantName: null,
  quantity: 1,
  unitPrice: 120000,
  imageURL: null,
  province: 'Solo',
  clothingType: 'batik',
};

beforeEach(() => {
  vi.clearAllMocks();
  // Set default mock implementations for all repository methods
  mockRepo.findExpiredPendingOrders.mockResolvedValue([] as never);
  mockRepo.findOrdersByUserId.mockResolvedValue([] as never);
  mockRepo.countOrdersByUserId.mockResolvedValue(0);
  mockRepo.findOrderDetailByIdentifier.mockResolvedValue(null as never);
  mockRepo.findOrderForCancellationById.mockResolvedValue(null as never);
  mockRepo.cancelOrderAndRestoreStock.mockResolvedValue(true);
  vi.mocked(expireMidtransTransaction).mockResolvedValue(undefined);
});

describe('orderService', { tags: ['backend'] }, () => {
  describe('getUserOrders', () => {
    it('should call repository methods with correct skip and take', async () => {
      mockRepo.findOrdersByUserId.mockResolvedValue([
        {
          id: '1',
          orderNumber: 'ORD-1',
          userId: 'user-1',
          orderStatus: 'pending',
          paymentStatus: 'unpaid',
          paymentTransactions: [],
          createdAt: new Date('2025-03-14T00:00:00.000Z'),
          totalAmount: 100000,
          items: [ITEM],
        },
      ] as never);
      mockRepo.countOrdersByUserId.mockResolvedValue(1);

      const result = await orderService.getUserOrders(
        'user-1',
        undefined,
        2,
        5,
      );

      expect(mockRepo.findOrdersByUserId).toHaveBeenCalledWith(
        'user-1',
        {},
        5,
        5,
      ); // page 2 limit 5 => skip 5, take 5
      expect(mockRepo.countOrdersByUserId).toHaveBeenCalledWith('user-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('ORD-1');
      expect(result.data[0].orderId).toBe('1');
      expect(result.data[0].status).toBe('Menunggu Bayar');
      expect(result.data[0].canCancel).toBe(true);
      expect(result.data[0].products).toHaveLength(1);
      expect(result.data[0].products[0].name).toBe('Batik');
      expect(result.data[0].paymentStatusLabel).toBe('Belum Bayar');

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should map filter statuses correctly', async () => {
      mockRepo.findOrdersByUserId.mockResolvedValue([] as never);
      mockRepo.countOrdersByUserId.mockResolvedValue(0);

      await orderService.getUserOrders('user-1', 'Dikonfirmasi', 1, 10);

      expect(mockRepo.findOrdersByUserId).toHaveBeenCalledWith(
        'user-1',
        { orderStatus: 'confirmed' },
        0,
        10,
      );
    });

    it('should reconcile expired orders before returning list', async () => {
      mockRepo.findOrdersByUserId.mockResolvedValue([] as never);
      mockRepo.countOrdersByUserId.mockResolvedValue(0);

      await orderService.getUserOrders('user-1');

      expect(mockRepo.findExpiredPendingOrders).toHaveBeenCalledWith(
        expect.any(Date),
        'user-1',
      );
    });
  });

  describe('getUserOrderDetail', () => {
    it('should return formatted order detail', async () => {
      mockRepo.findOrderDetailByIdentifier.mockResolvedValue({
        id: 'order-id-1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        subtotal: 120000,
        shippingCost: 30000,
        totalAmount: 150000,
        productPrice: 120000,
        quantity: 1,
        productId: 'prod-1',
        variantId: null,
        courier: 'JNE',
        courierService: 'REG',
        trackingNumber: 'RESI-1',
        estimatedDelivery: null,
        customerNotes: null,
        createdAt: new Date('2025-03-14T00:00:00.000Z'),
        items: [ITEM],
        shippingAddress: {
          recipientName: 'User',
          phone: '0812',
          province: 'Jawa Tengah',
          city: 'Solo',
          district: 'Laweyan',
          subdistrict: null,
          postalCode: '57147',
          fullAddress: 'Jl. Mawar No. 1',
        },
        paymentTransactions: [
          {
            id: 'trx-1',
            status: 'success',
            paymentUrl: null,
            vaNumber: '123456',
            paidAt: null,
            expiredAt: null,
            createdAt: new Date('2025-03-14T00:00:00.000Z'),
          },
        ],
      } as never);

      const result = await orderService.getUserOrderDetail('user-1', 'ORD-1');

      expect(mockRepo.findOrderDetailByIdentifier).toHaveBeenCalledWith(
        'user-1',
        'ORD-1',
      );
      expect(result.orderId).toBe('order-id-1');
      expect(result.orderNumber).toBe('ORD-1');
      expect(result.orderStatus).toBe('Dikonfirmasi');
      expect(result.paymentStatus).toBe('paid');
      expect(result.paymentStatusLabel).toBe('Lunas');
      expect(result.totals.totalAmount).toContain('Rp');
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Batik');
    });

    it('should throw ApiError when order not found', async () => {
      mockRepo.findOrderDetailByIdentifier.mockResolvedValue(null);

      await expect(
        orderService.getUserOrderDetail('user-1', 'ORD-404'),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('cancelUserOrder', () => {
    it('should cancel unpaid pending order', async () => {
      mockRepo.findOrderForUserByIdentifier.mockResolvedValue({
        id: 'order-id-1',
        orderNumber: 'ORD-1',
        userId: 'user-1',
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: null,
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
        productPrice: 120000,
        subtotal: 120000,
        shippingCost: 30000,
        totalAmount: 150000,
        courier: 'JNE',
        courierService: 'REG',
        trackingNumber: null,
        estimatedDelivery: null,
        customerNotes: null,
        createdAt: new Date('2025-03-14T00:00:00.000Z'),
        paymentTransactions: [
          {
            id: 'trx-1',
            status: 'pending',
            expiredAt: new Date('2099-03-14T00:30:00.000Z'),
            paidAt: null,
            createdAt: new Date('2025-03-14T00:00:00.000Z'),
          },
        ],
        product: {
          id: 'prod-1',
          name: 'Batik',
          province: 'Solo',
          clothingType: 'batik',
        },
        shippingAddress: {
          recipientName: 'User',
          phone: '0812',
          province: 'Jawa Tengah',
          city: 'Solo',
          district: 'Laweyan',
          subdistrict: null,
          postalCode: '57147',
          fullAddress: 'Jl. Mawar No. 1',
        },
      } as never);
      mockRepo.findOrderDetailByIdentifier.mockResolvedValue({
        id: 'order-id-1',
        orderNumber: 'ORD-1',
        orderStatus: 'cancelled',
        paymentStatus: 'failed',
        paymentMethod: null,
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
        productPrice: 120000,
        subtotal: 120000,
        shippingCost: 30000,
        totalAmount: 150000,
        courier: 'JNE',
        courierService: 'REG',
        trackingNumber: null,
        estimatedDelivery: null,
        customerNotes: null,
        createdAt: new Date('2025-03-14T00:00:00.000Z'),
        paymentTransactions: [
          {
            id: 'trx-1',
            status: 'failed',
            paymentUrl: null,
            vaNumber: null,
            paidAt: null,
            expiredAt: new Date('2025-03-14T00:30:00.000Z'),
            createdAt: new Date('2025-03-14T00:00:00.000Z'),
          },
        ],
        items: [ITEM],
        shippingAddress: {
          recipientName: 'User',
          phone: '0812',
          province: 'Jawa Tengah',
          city: 'Solo',
          district: 'Laweyan',
          subdistrict: null,
          postalCode: '57147',
          fullAddress: 'Jl. Mawar No. 1',
        },
      } as never);

      const result = await orderService.cancelUserOrder('user-1', 'ORD-1');

      expect(result.orderStatus).toBe('Dibatalkan');
      expect(result.paymentStatus).toBe('failed');
      // The Midtrans transaction is closed so it can't be paid afterwards.
      expect(expireMidtransTransaction).toHaveBeenCalledWith('order-id-1');
    });

    it('should reject cancelling non-cancellable order', async () => {
      mockRepo.findOrderForUserByIdentifier.mockResolvedValue({
        id: 'order-id-1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentTransactions: [
          {
            id: 'trx-1',
            status: 'success',
            expiredAt: null,
            paidAt: new Date('2025-03-14T00:10:00.000Z'),
            createdAt: new Date('2025-03-14T00:00:00.000Z'),
          },
        ],
      } as never);

      await expect(
        orderService.cancelUserOrder('user-1', 'ORD-1'),
      ).rejects.toThrow(
        'Pesanan ini tidak dapat dibatalkan karena pembayaran sudah diproses atau masa bayar telah habis',
      );
    });
  });

  describe('cancelOrderBySystemId', () => {
    it('should cancel pending unpaid order with expired reason', async () => {
      mockRepo.findOrderForCancellationById.mockResolvedValue({
        id: 'order-id-1',
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
        customerNotes: null,
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        paymentTransactions: [
          {
            status: 'pending',
            expiredAt: new Date('2025-03-14T00:30:00.000Z'),
          },
        ],
      } as never);

      await orderService.cancelOrderBySystemId('order-id-1', 'expired');

      expect(mockRepo.findOrderForCancellationById).toHaveBeenCalledWith(
        'order-id-1',
      );
      expect(mockRepo.cancelOrderAndRestoreStock).toHaveBeenCalledWith(
        'order-id-1',
        'expired',
        expect.any(Date),
      );
    });

    it('should throw ApiError when order is not found', async () => {
      mockRepo.findOrderForCancellationById.mockResolvedValue(null);

      await expect(
        orderService.cancelOrderBySystemId('order-404', 'failed'),
      ).rejects.toThrow(ApiError);

      expect(mockRepo.cancelOrderAndRestoreStock).not.toHaveBeenCalled();
    });
  });
});

describe('reconcileExpiredOrders', { tags: ['backend'] }, () => {
  const expired = {
    id: 'ord-1',
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
  };
  const status = (transaction_status: string) => ({
    transaction_id: 'tx-1',
    order_id: 'ord-1',
    gross_amount: '371000.00',
    status_code: '200',
    transaction_status,
    signature_key: 'sig',
    payment_type: 'bank_transfer',
  });

  beforeEach(() => {
    mockRepo.findExpiredPendingOrders.mockResolvedValue([expired] as never);
  });

  it('confirms an order Midtrans says is paid instead of cancelling it', async () => {
    vi.mocked(getMidtransTransactionStatus).mockResolvedValue(
      status('settlement'),
    );

    await orderService.getUserOrders('user-1');

    expect(paymentService.handleNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'ord-1',
        transaction_status: 'settlement',
      }),
    );
    expect(mockRepo.cancelOrderAndRestoreStock).not.toHaveBeenCalled();
  });

  it('cancels and closes an order still unpaid at Midtrans', async () => {
    vi.mocked(getMidtransTransactionStatus).mockResolvedValue(
      status('pending'),
    );

    await orderService.getUserOrders('user-1');

    expect(mockRepo.cancelOrderAndRestoreStock).toHaveBeenCalled();
    expect(expireMidtransTransaction).toHaveBeenCalledWith('ord-1');
  });

  it('cancels when the buyer never picked a payment method', async () => {
    vi.mocked(getMidtransTransactionStatus).mockResolvedValue(null);

    await orderService.getUserOrders('user-1');

    expect(mockRepo.cancelOrderAndRestoreStock).toHaveBeenCalled();
    expect(expireMidtransTransaction).not.toHaveBeenCalled();
  });

  it('leaves the order pending when Midtrans cannot be reached', async () => {
    vi.mocked(getMidtransTransactionStatus).mockRejectedValue(
      new Error('ECONNRESET'),
    );

    await orderService.getUserOrders('user-1');

    expect(mockRepo.cancelOrderAndRestoreStock).not.toHaveBeenCalled();
  });
});
