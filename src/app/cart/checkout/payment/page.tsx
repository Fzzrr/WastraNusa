import { PaymentMain } from '@/components/checkout/payment/payment-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pembayaran' };

export default async function PaymentPage() {
  await requireUser();
  return <PaymentMain />;
}
