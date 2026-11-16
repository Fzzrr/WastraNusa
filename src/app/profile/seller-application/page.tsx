import { SellerApplicationMain } from '@/components/profile/seller-application/seller-application-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pengajuan Penjual' };

export default async function SellerApplicationPage() {
  await requireUser();

  return <SellerApplicationMain />;
}
