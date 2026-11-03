import { POST } from '@/app/api/checkout/route';
import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { paymentService } from '@/services/payment.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockService = vi.mocked(paymentService);
const mockAuth = vi.mocked(AuthHelper);

describe('Checkout API', { tags: ['backend'] }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCheckoutInput = {
    items: [{ productId: 'p-123', variantId: 'v-456', quantity: 1 }],
    shippingAddressId: 'a-789',
    shippingOptionId: 'jne-reg',
  };

  it('should return 201 and checkout data on success', async () => {
    mockAuth.requireUser.mockResolvedValue({ id: 'user-1' } as never);
    mockService.checkout.mockResolvedValue({
      orderId: 'o-1',
      orderNumber: 'ORD-1',
      token: 'snap-1',
      redirect_url: 'http://midtrans.com/1',
    });

    const req = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify(mockCheckoutInput),
    });

    const response = await POST(req, { params: Promise.resolve({}) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe('success');
    expect(body.data.orderId).toBe('o-1');
    expect(mockAuth.requireUser).toHaveBeenCalled();
    expect(mockService.checkout).toHaveBeenCalledWith(
      expect.objectContaining(mockCheckoutInput),
      'user-1',
    );
  });

  it('should return 400 for invalid input', async () => {
    mockAuth.requireUser.mockResolvedValue({ id: 'user-1' } as never);

    const req = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items: [] }), // Invalid input
    });

    const response = await POST(req, { params: Promise.resolve({}) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.status).toBe('fail');
  });
});
