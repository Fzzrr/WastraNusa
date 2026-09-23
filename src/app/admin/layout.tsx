import { AdminSidebarProvider } from '@/components/admin/admin-sidebar-context';
import { AdminSidebarShell } from '@/components/admin/admin-sidebar-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarProvider>
      <div
        style={
          {
            '--sidebar-width': '18.5rem',
            '--sidebar': '#305645',
            '--sidebar-foreground': '#f4efe2',
            '--sidebar-border': 'rgba(255, 255, 255, 0.08)',
            '--sidebar-accent': 'rgba(255, 255, 255, 0.08)',
            '--sidebar-accent-foreground': '#ffffff',
            '--sidebar-primary': '#4b6f5f',
            '--sidebar-primary-foreground': '#ffffff',
            '--sidebar-ring': 'rgba(231, 184, 109, 0.4)',
          } as React.CSSProperties
        }
        className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_28%),linear-gradient(180deg,_#f4ede2_0%,_#efe7db_100%)]"
      >
        <AdminSidebarShell />
        <div className="min-h-screen min-w-0 flex-1 bg-transparent">
          <div className="flex min-h-screen flex-col">{children}</div>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
