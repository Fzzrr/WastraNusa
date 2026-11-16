import { CheckoutMain } from '@/components/checkout/checkout-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pengiriman' };

export default async function CheckoutPage() {
  await requireUser();
  return <CheckoutMain />;
}
