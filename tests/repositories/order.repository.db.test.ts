// Runs only against a throwaway database: set TEST_DATABASE_URL (CI does).
// Never point it at a database whose data you care about.
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  if (process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }
});
vi.unmock('@/lib/prisma');
vi.unmock('@/repositories/order.repository');

const { default: prisma } = await import('@/lib/prisma');
const { orderRepository } = await import('@/repositories/order.repository');

const id = () => crypto.randomUUID();

async function seed(stock: number) {
  const buyerId = id();
  const sellerId = id();
  await prisma.user.createMany({
    data: [
      { id: buyerId, name: 'Buyer', email: `${buyerId}@test.local` },
      {
        id: sellerId,
        name: 'Seller',
        email: `${sellerId}@test.local`,
        role: 'seller',
      },
    ],
  });
  const article = await prisma.article.create({
    data: {
      id: id(),
      title: 'Batik',
      slug: id(),
      excerpt: 'x',
      region: 'Solo',
      topic: 'Batik',
      motifLabel: 'Parang',
      createdBy: sellerId,
    },
  });
  const product = await prisma.product.create({
    data: {
      id: id(),
      articleId: article.id,
      sellerId,
      name: 'Batik Parang',
      slug: id(),
      price: 100000,
      sku: id(),
      weight: 500,
      island: 'Jawa',
      province: 'Jawa Tengah',
      clothingType: 'Batik',
      variants: {
        create: { id: id(), name: 'M', type: 'size', stock, sku: id() },
      },
    },
    include: { variants: true },
  });
  const address = await prisma.customerAddress.create({
    data: {
      id: id(),
      userId: buyerId,
      label: 'Rumah',
      recipientName: 'Buyer',
      phone: '081234567890',
      province: 'Jawa Tengah',
      city: 'Solo',
      district: 'Laweyan',
      postalCode: '57147',
      fullAddress: 'Jl. Mawar 1',
    },
  });
  return { buyerId, sellerId, product, variant: product.variants[0], address };
}

type Seed = Awaited<ReturnType<typeof seed>>;

function placeOrder(
  s: Seed,
  quantity: number,
  expiredAt = new Date(Date.now() + 30 * 60_000),
) {
  const orderId = id();
  return orderRepository
    .createOrderAndReserveStock(
      {
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        userId: s.buyerId,
        sellerId: s.sellerId,
        productId: s.product.id,
        variantId: s.variant.id,
        productName: s.product.name,
        quantity,
        productPrice: 100000 * quantity,
        shippingAddressId: s.address.id,
        courier: 'JNE',
        courierService: 'REG',
        subtotal: 100000 * quantity,
        shippingCost: 18000,
        totalAmount: 100000 * quantity + 18000,
      },
      [
        {
          productId: s.product.id,
          variantId: s.variant.id,
          quantity,
          productName: s.product.name,
          variantName: 'M',
          unitPrice: 100000,
          province: 'Jawa Tengah',
          clothingType: 'Batik',
          imageURL: null,
        },
      ],
      {
        id: id(),
        externalId: orderId,
        amount: 100000 * quantity + 18000,
        status: 'pending',
        expiredAt,
        createdAt: new Date(),
      },
    )
    .then(() => orderId);
}

const stockOf = async (variantId: string) =>
  (await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } }))
    .stock;

describe.skipIf(!process.env.TEST_DATABASE_URL)(
  'orderRepository (database)',
  { tags: ['db'] },
  () => {
    it('reserves stock and creates the order with its payment transaction', async () => {
      const s = await seed(5);
      const orderId = await placeOrder(s, 2);

      expect(await stockOf(s.variant.id)).toBe(3);
      const tx = await prisma.paymentTransaction.findUnique({
        where: { externalId: orderId },
      });
      expect(tx?.status).toBe('pending');
    });

    it('rolls the whole checkout back when stock runs out', async () => {
      const s = await seed(1);

      await expect(placeOrder(s, 2)).rejects.toMatchObject({ status: 409 });
      expect(await stockOf(s.variant.id)).toBe(1);
      expect(await prisma.order.count({ where: { userId: s.buyerId } })).toBe(
        0,
      );
    });

    it('lets only one of two racing buyers take the last unit', async () => {
      const s = await seed(1);

      const results = await Promise.allSettled([
        placeOrder(s, 1),
        placeOrder(s, 1),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await stockOf(s.variant.id)).toBe(0);
    });

    it('restores stock only once when an order is cancelled twice', async () => {
      const s = await seed(5);
      const orderId = await placeOrder(s, 2);

      const [first, second] = await Promise.all([
        orderRepository.cancelOrderAndRestoreStock(orderId, 'expired'),
        orderRepository.cancelOrderAndRestoreStock(orderId, 'expired'),
      ]);

      expect([first, second].filter(Boolean)).toHaveLength(1);
      expect(await stockOf(s.variant.id)).toBe(5);
      const tx = await prisma.paymentTransaction.findUnique({
        where: { externalId: orderId },
      });
      expect(tx?.status).toBe('expired');
    });

    it('counts a paid order as sold only once across webhook retries', async () => {
      const s = await seed(5);
      const orderId = await placeOrder(s, 2);
      const data = { paymentMethod: 'qris', paidAt: new Date() };

      const first = await orderRepository.confirmPaidOrder(orderId, data);
      const retry = await orderRepository.confirmPaidOrder(orderId, data);

      expect([first.count, retry.count]).toEqual([1, 0]);
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: s.product.id },
      });
      expect(product.sold).toBe(2);
    });

    it('finds expired pending orders only within the requested scope', async () => {
      const s = await seed(10);
      const other = await seed(10);
      const past = new Date(Date.now() - 60_000);
      const expired = await placeOrder(s, 1, past);
      await placeOrder(s, 1); // still inside its payment window
      await placeOrder(other, 1, past);

      const found = await orderRepository.findExpiredPendingOrders(
        new Date(),
        { sellerId: s.sellerId },
        10,
      );

      expect(found.map((o) => o.id)).toEqual([expired]);
    });
  },
);
