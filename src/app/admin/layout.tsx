import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { PanelShell } from '@/components/panel-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Panel Admin' };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelShell sidebar={<AdminSidebar />}>{children}</PanelShell>;
}
