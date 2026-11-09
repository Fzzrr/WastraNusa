import 'dotenv/config';

import { seedAddresses } from './address.seed';
import { seedArticles } from './article.seed';
import { seedCarts } from './cart.seed';
import { seedOrders } from './order.seed';
import { seedProducts } from './product.seed';
import { seedUsers } from './user.seed';

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set.');
  process.exit(1);
}

const databaseHost = new URL(process.env.DATABASE_URL).hostname;
const isLocal = ['localhost', '127.0.0.1', 'database'].includes(databaseHost);

// The seed deletes orders. Neon dev needs ALLOW_REMOTE_SEED=true; never set it
// for production.
if (!isLocal && process.env.ALLOW_REMOTE_SEED !== 'true') {
  console.error(`Refusing to seed remote database: ${databaseHost}`);
  process.exit(1);
}

async function main() {
  console.log('Starting seed process...');

  await seedUsers();
  await seedArticles();
  await seedProducts();
  await seedAddresses();
  await seedCarts();
  await seedOrders();

  console.log('\nSeeding complete!');
}

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
