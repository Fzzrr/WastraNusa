import { SellerSidebar } from '@/components/seller/seller-sidebar';
import { SellerSidebarProvider } from '@/components/seller/seller-sidebar-context';
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
    <SellerSidebarProvider>
      <div
        style={
          {
            '--sidebar-width': '18.5rem',
            '--sidebar': 'var(--field)',
            '--sidebar-foreground': 'var(--on-field)',
            '--sidebar-border': 'rgba(255, 255, 255, 0.08)',
            '--sidebar-accent': 'rgba(255, 255, 255, 0.08)',
            '--sidebar-accent-foreground': '#ffffff',
            '--sidebar-primary': '#4b6f5f',
            '--sidebar-primary-foreground': '#ffffff',
            '--sidebar-ring': 'rgba(231, 184, 109, 0.4)',
          } as React.CSSProperties
        }
        className="flex min-h-dvh"
      >
        <SellerSidebar shopName={shopName} />
        <div className="min-h-dvh min-w-0 flex-1 bg-transparent">
          <div className="flex min-h-dvh flex-col">{children}</div>
        </div>
      </div>
    </SellerSidebarProvider>
  );
}
