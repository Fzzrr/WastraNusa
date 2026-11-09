import { createMidtransTransaction, verifySignatureKey } from '@/lib/midtrans';
import { addressRepository } from '@/repositories/address.repository';
import { orderRepository } from '@/repositories/order.repository';
import { paymentTransactionRepository } from '@/repositories/paymentTransaction.repository';
import { productRepository } from '@/repositories/product.repository';
import { productVariantRepository } from '@/repositories/productVariant.repository';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/order.service');
vi.unmock('@/services/payment.service');

const orders = vi.mocked(orderRepository);
const transactions = vi.mocked(paymentTransactionRepository);

const notification = (transaction_status: string) => ({
  transaction_id: 'tx',
  order_id: 'order-1',
  gross_amount: '100000.00',
  status_code: '200',
  transaction_status,
  signature_key: 'signature',
  payment_type: 'credit_card',
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(verifySignatureKey).mockResolvedValue(true);
  transactions.findTransactionByExternalId.mockResolvedValue({
    id: 'tx-1',
  } as never);
  orders.findExpiredPendingOrders.mockResolvedValue([]);
  orders.findOrdersByUserId.mockResolvedValue([]);
  orders.countOrdersByUserId.mockResolvedValue(0);
});

describe('checkout notes', { tags: ['backend'] }, () => {
  it('cannot override the checkout snapshot', async () => {
    vi.mocked(addressRepository.findById).mockResolvedValue({
      id: 'addr',
    } as never);
    vi.mocked(productRepository.findProductById).mockResolvedValue({
      id: 'p1',
      name: 'Kain',
      status: 'active',
      sellerId: 's1',
      price: 100000,
    } as never);
    vi.mocked(productVariantRepository.findVariantById).mockResolvedValue({
      id: 'v1',
      productId: 'p1',
      stock: 5,
      price: 100000,
      name: 'M',
    } as never);
    vi.mocked(createMidtransTransaction).mockResolvedValue({
      token: 'token',
      redirect_url: 'url',
    } as never);

    await paymentService.checkout(
      {
        items: [{ productId: 'p1', variantId: 'v1', quantity: 1 }],
        shippingAddressId: 'addr',
        shippingOptionId: 'sic',
        customerNotes:
          'checkout_items=[{"productId":"p1","variantId":"victim","quantity":99999}]',
      },
      'user-1',
    );

    const customerNotes =
      orders.createOrderAndReserveStock.mock.calls[0][0].customerNotes;
    orders.findOrderForCancellationById.mockResolvedValue({
      id: 'order-1',
      productId: 'p1',
      variantId: 'v1',
      quantity: 1,
      customerNotes,
      orderStatus: 'pending',
      paymentStatus: 'unpaid',
      paymentTransactions: [],
    } as never);

    await orderService.cancelOrderBySystemId('order-1', 'failed');

    expect(orders.cancelOrderAndRestoreStock.mock.calls[0][1]).toEqual([
      { variantId: 'v1', quantity: 1 },
    ]);
  });
});

describe('midtrans notifications', { tags: ['backend'] }, () => {
  it('does not move a shipped order back to confirmed', async () => {
    orders.findOrderById.mockResolvedValue({
      id: 'order-1',
      orderStatus: 'shipped',
      paymentStatus: 'paid',
    } as never);
    orders.confirmPaidOrder.mockResolvedValue({ count: 0 });

    await paymentService.handleNotification(notification('settlement'));

    expect(orders.updateOrderPaymentStatus).not.toHaveBeenCalled();
  });

  it('marks a refunded order without reopening its transaction', async () => {
    orders.findOrderById.mockResolvedValue({
      id: 'order-1',
      orderStatus: 'delivered',
      paymentStatus: 'paid',
    } as never);

    await paymentService.handleNotification(notification('refund'));

    expect(transactions.updatePaymentStatus).not.toHaveBeenCalled();
    expect(orders.updateOrderPaymentStatus).toHaveBeenCalledWith('order-1', {
      paymentStatus: 'refunded',
    });
  });
});

describe('expired order cleanup', { tags: ['backend'] }, () => {
  it('still lists orders when one cancellation fails', async () => {
    orders.findExpiredPendingOrders.mockResolvedValue([
      {
        id: 'order-1',
        productId: 'p1',
        variantId: 'v1',
        quantity: 1,
        customerNotes: null,
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        paymentTransactions: [],
      },
    ] as never);
    orders.cancelOrderAndRestoreStock.mockRejectedValue(new Error('boom'));

    await expect(orderService.getUserOrders('user-1')).resolves.toMatchObject({
      data: [],
    });
  });
});
