import { CartMain } from '@/components/cart/cart-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keranjang',
};

export default async function CartPage() {
  await requireUser();
  return <CartMain />;
}
