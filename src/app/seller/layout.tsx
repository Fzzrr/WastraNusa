import { PanelShell } from '@/components/panel-shell';
import { SellerSidebar } from '@/components/seller/seller-sidebar';
import { requireSeller } from '@/lib/auth/auth-page-helper';
import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Panel Penjual' };

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSeller();
  const application = await sellerApplicationRepository.findByUser(user.id);
  const shopName = application?.shopName ?? 'Toko Saya';

  return (
    <PanelShell sidebar={<SellerSidebar shopName={shopName} />}>
      {children}
    </PanelShell>
  );
}
