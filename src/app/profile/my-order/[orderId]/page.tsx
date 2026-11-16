import { MyOrderDetailMain } from '@/components/profile/my-order/my-order-detail-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Detail Pesanan' };

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function MyOrderDetailPage({ params }: Props) {
  await requireUser();
  const { orderId } = await params;

  return <MyOrderDetailMain orderId={orderId} />;
}
