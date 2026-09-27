import crypto from 'crypto';

import type {
  OrderStatus,
  PaymentStatus,
} from '../../src/generated/prisma/client';
import prisma from '../../src/lib/prisma';
import { SEED_REGULAR_USER } from './user.seed';

export async function seedOrders() {
  const user = await prisma.user.findFirst({
    where: { email: SEED_REGULAR_USER.email },
  });

  if (!user) {
    console.error('User not found. Run user seed first.');
    return;
  }

  const product = await prisma.product.findFirst();
  if (!product) {
    console.error('Product not found. Run product seed first.');
    return;
  }

  let address = await prisma.customerAddress.findFirst({
    where: { userId: user.id },
  });

  if (!address) {
    console.error('Address not found for user. Creating a dummy address...');
    address = await prisma.customerAddress.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        label: 'Rumah',
        recipientName: user.name || 'User',
        phone: '08123456789',
        province: 'Jawa Barat',
        city: 'Bandung',
        district: 'Coblong',
        postalCode: '40132',
        fullAddress: 'Jl. Ir. H. Juanda No. 100',
        isDefault: true,
      },
    });
  }

  const baseOrder = {
    userId: user.id,
    productId: product.id,
    productName: product.name,
    sellerId: product.sellerId,
    quantity: 1,
    productPrice: product.price,
    shippingAddressId: address.id,
    courier: 'JNE',
    courierService: 'REG',
    subtotal: product.price,
    shippingCost: 15000,
    totalAmount: Number(product.price) + 15000,
  };

  const statuses: {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    trackingNumber?: string;
  }[] = [
    { orderStatus: 'pending', paymentStatus: 'unpaid' },
    { orderStatus: 'confirmed', paymentStatus: 'paid' },
    { orderStatus: 'processing', paymentStatus: 'paid' },
    {
      orderStatus: 'shipped',
      paymentStatus: 'paid',
      trackingNumber: 'RESI123456789',
    },
    {
      orderStatus: 'delivered',
      paymentStatus: 'paid',
      trackingNumber: 'RESI987654321',
    },
    { orderStatus: 'cancelled', paymentStatus: 'failed' },
  ];

  // delete all existing orders for this user first
  await prisma.order.deleteMany({
    where: { userId: user.id },
  });

  for (const status of statuses) {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await prisma.order.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber,
        ...baseOrder,
        orderStatus: status.orderStatus,
        paymentStatus: status.paymentStatus,
        trackingNumber: status.trackingNumber || null,
        paidAt: status.paymentStatus === 'paid' ? new Date() : null,
        shippedAt: ['shipped', 'delivered'].includes(status.orderStatus)
          ? new Date()
          : null,
        deliveredAt: status.orderStatus === 'delivered' ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${statuses.length} orders for user ${user.email}`);
}
