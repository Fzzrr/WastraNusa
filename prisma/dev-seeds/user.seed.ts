import { auth } from '../../src/lib/auth/auth';
import prisma from '../../src/lib/prisma';

export const SEED_ADMIN_USER = {
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'Admin@12345',
  role: 'admin',
};

export const SEED_REGULAR_USER = {
  name: 'Regular User',
  email: 'user@test.com',
  password: 'User@12345',
  role: 'user',
};

/**
 * A pre-approved seller that owns the seed products/orders (see product.seed.ts
 * and order.seed.ts). Its shop name matches the design mock.
 */
export const SEED_SELLER_USER = {
  name: 'Sari Nusantara',
  email: 'seller@test.com',
  password: 'Seller@12345',
  role: 'seller',
  shopName: 'Batik Sari Nusantara',
};

export async function seedUsers() {
  const users = [SEED_ADMIN_USER, SEED_REGULAR_USER, SEED_SELLER_USER];

  for (const user of users) {
    const existingUser = await prisma.user.findFirst({
      where: { email: user.email },
    });

    let userId: string;

    if (!existingUser) {
      const response = await auth.api.signUpEmail({
        body: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      });

      await prisma.user.update({
        where: { id: response.user.id },
        data: {
          emailVerified: true,
          role: user.role,
        },
      });

      userId = response.user.id;
      console.log(`Created user: ${user.email} (role: ${user.role})`);
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: true,
          role: user.role,
        },
      });
      userId = existingUser.id;
      console.log(`Updated existing user: ${user.email} (role: ${user.role})`);
    }

    // Give the seed seller an approved application so the seller panel has a
    // store name to display.
    if (user.email === SEED_SELLER_USER.email) {
      await prisma.sellerApplication.upsert({
        where: { userId },
        update: {
          shopName: SEED_SELLER_USER.shopName,
          status: 'approved',
          reviewedAt: new Date(),
        },
        create: {
          id: crypto.randomUUID(),
          userId,
          shopName: SEED_SELLER_USER.shopName,
          status: 'approved',
          reviewedAt: new Date(),
        },
      });
    }
  }

  console.log(`Seeded ${users.length} users`);
}
