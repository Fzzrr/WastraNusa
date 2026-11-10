import { AdminSidebarProvider } from '@/components/admin/admin-sidebar-context';
import { AdminSidebarShell } from '@/components/admin/admin-sidebar-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Panel Admin' };

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
        <AdminSidebarShell />
        <div className="min-h-dvh min-w-0 flex-1 bg-transparent">
          <div className="flex min-h-dvh flex-col">{children}</div>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
