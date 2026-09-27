import { SellerSidebar } from '@/components/seller/seller-sidebar';
import { SellerSidebarProvider } from '@/components/seller/seller-sidebar-context';
import { requireSeller } from '@/lib/auth/auth-page-helper';
import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';

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
            '--sidebar': '#1f3d2c',
            '--sidebar-foreground': '#eef3e7',
            '--sidebar-border': 'rgba(255, 255, 255, 0.08)',
            '--sidebar-accent': 'rgba(255, 255, 255, 0.08)',
            '--sidebar-accent-foreground': '#ffffff',
            '--sidebar-primary': '#4a6b3a',
            '--sidebar-primary-foreground': '#ffffff',
            '--sidebar-ring': 'rgba(217, 176, 97, 0.4)',
          } as React.CSSProperties
        }
        className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_28%),linear-gradient(180deg,_#eef3e5_0%,_#e7efdb_100%)]"
      >
        <SellerSidebar shopName={shopName} />
        <div className="min-h-screen min-w-0 flex-1 bg-transparent">
          <div className="flex min-h-screen flex-col">{children}</div>
        </div>
      </div>
    </SellerSidebarProvider>
  );
}
