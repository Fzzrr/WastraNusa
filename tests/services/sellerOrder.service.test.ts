import { sellerOrderRepository } from '@/repositories/sellerOrder.repository';
import { sellerOrderService } from '@/services/sellerOrder.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/order.service');
vi.mock('@/repositories/sellerOrder.repository', () => ({
  sellerOrderRepository: {
    findOrdersBySeller: vi.fn(),
    countOrdersBySeller: vi.fn(),
    findOrderForSellerByIdentifier: vi.fn(),
    updateOrderForSeller: vi.fn(),
  },
}));

const repo = vi.mocked(sellerOrderRepository);

const order = (overrides: Record<string, unknown> = {}) => ({
  id: 'order-1',
  orderNumber: 'ORD-1',
  totalAmount: 150000,
  orderStatus: 'processing',
  paymentStatus: 'paid',
  trackingNumber: null,
  createdAt: new Date('2025-03-14T00:00:00.000Z'),
  customerNotes: null,
  courier: 'JNE',
  courierService: 'REG',
  shippingAddress: {
    recipientName: 'Budi',
    phone: '0812',
    fullAddress: 'Jl. Mawar 1',
    subdistrict: null,
    district: 'Laweyan',
    city: 'Solo',
    province: 'Jawa Tengah',
    postalCode: '57147',
  },
  user: { id: 'user-1', name: 'User', email: 'user@example.com' },
  items: [
    {
      productId: 'prod-1',
      variantId: 'var-1',
      productName: 'Batik',
      variantName: 'M',
      quantity: 1,
      unitPrice: 120000,
      imageURL: null,
      province: 'Solo',
      clothingType: 'batik',
    },
  ],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe(
  'sellerOrderService.updateOrderForSeller',
  { tags: ['backend'] },
  () => {
    it('ships an order with a tracking number and maps every item', async () => {
      repo.findOrderForSellerByIdentifier.mockResolvedValue(order() as never);
      repo.updateOrderForSeller.mockResolvedValue(
        order({ orderStatus: 'shipped', trackingNumber: 'RESI-1' }) as never,
      );

      const result = await sellerOrderService.updateOrderForSeller(
        'seller-1',
        'ORD-1',
        { orderStatus: 'shipped', trackingNumber: ' RESI-1 ' },
      );

      expect(repo.updateOrderForSeller).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          orderStatus: 'shipped',
          trackingNumber: 'RESI-1',
          shippedAt: expect.any(Date),
        }),
      );
      expect(result.shipping).toEqual({
        recipientName: 'Budi',
        phone: '0812',
        address: 'Jl. Mawar 1, Laweyan, Solo, Jawa Tengah, 57147',
        courier: 'JNE REG',
      });
      expect(result.products).toEqual([
        expect.objectContaining({ name: 'Batik', variant: 'M', quantity: 1 }),
      ]);
    });

    it('does not move an order back to an earlier status', async () => {
      repo.findOrderForSellerByIdentifier.mockResolvedValue(
        order({ orderStatus: 'delivered', trackingNumber: 'RESI-1' }) as never,
      );

      await expect(
        sellerOrderService.updateOrderForSeller('seller-1', 'ORD-1', {
          orderStatus: 'processing',
        }),
      ).rejects.toThrow('Status pesanan tidak dapat dimundurkan');
      expect(repo.updateOrderForSeller).not.toHaveBeenCalled();
    });

    it('requires a tracking number to ship', async () => {
      repo.findOrderForSellerByIdentifier.mockResolvedValue(order() as never);

      await expect(
        sellerOrderService.updateOrderForSeller('seller-1', 'ORD-1', {
          orderStatus: 'shipped',
        }),
      ).rejects.toThrow('Nomor resi wajib diisi untuk pesanan yang dikirim');
    });

    it('rejects an unpaid order', async () => {
      repo.findOrderForSellerByIdentifier.mockResolvedValue(
        order({ orderStatus: 'pending', paymentStatus: 'unpaid' }) as never,
      );

      await expect(
        sellerOrderService.updateOrderForSeller('seller-1', 'ORD-1', {
          orderStatus: 'processing',
        }),
      ).rejects.toThrow(
        'Pesanan hanya dapat diubah jika pembayaran sudah berhasil',
      );
    });

    it('only finds orders of this seller', async () => {
      repo.findOrderForSellerByIdentifier.mockResolvedValue(null);

      await expect(
        sellerOrderService.updateOrderForSeller('seller-2', 'ORD-1', {
          orderStatus: 'processing',
        }),
      ).rejects.toThrow('Pesanan tidak ditemukan');
      expect(repo.findOrderForSellerByIdentifier).toHaveBeenCalledWith(
        'seller-2',
        'ORD-1',
      );
    });
  },
);
