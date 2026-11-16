import { MyOrderMain } from '@/components/profile/my-order/my-order-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pesanan Saya' };

export default async function MyOrderPage() {
  await requireUser();

  return <MyOrderMain />;
}
