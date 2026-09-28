import { GET } from '@/app/api/orders/route';
import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { orderService } from '@/services/order.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockService = vi.mocked(orderService);
const mockAuth = vi.mocked(AuthHelper);

describe('Orders API GET', { tags: ['backend'] }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 and orders data on success with default pagination', async () => {
    mockAuth.requireUser.mockResolvedValue({ id: 'user-1' } as never);

    const mockOrderResult = {
      data: [
        {
          orderId: 'order-id-1',
          id: 'ORD-123',
          date: '14 Mar 2025',
          totalPrice: 'Rp 100.000',
          status: 'Menunggu Bayar' as const,
          paymentStatus: 'unpaid' as const,
          paymentStatusLabel: 'Belum Bayar',
          paymentDeadlineAt: '2025-03-14T12:00:00Z',
          canCancel: true,
          products: [
            {
              category: 'Batik',
              name: 'Batik Kawung',
              location: 'Solo',
              quantity: 1,
              imageURL: null,
              unitPrice: 'Rp 100.000',
            },
          ],
          actions: ['Detail'] as 'Detail'[],
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    mockService.getUserOrders.mockResolvedValue(mockOrderResult);

    const req = new Request('http://localhost/api/orders');

    const response = await GET(req, { params: Promise.resolve({}) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toEqual(mockOrderResult);

    expect(mockAuth.requireUser).toHaveBeenCalled();
    expect(mockService.getUserOrders).toHaveBeenCalledWith(
      'user-1',
      undefined,
      1,
      10,
    );
  });

  it('should pass status, page, and limit query parameters correctly', async () => {
    mockAuth.requireUser.mockResolvedValue({ id: 'user-1' } as never);

    mockService.getUserOrders.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
    });

    const req = new Request(
      'http://localhost/api/orders?status=Dikirim&page=2&limit=5',
    );

    const response = await GET(req, { params: Promise.resolve({}) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('success');

    expect(mockAuth.requireUser).toHaveBeenCalled();
    expect(mockService.getUserOrders).toHaveBeenCalledWith(
      'user-1',
      'Dikirim',
      2,
      5,
    );
  });
});
