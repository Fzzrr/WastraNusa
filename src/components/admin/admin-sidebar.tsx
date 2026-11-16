'use client';

import { PanelSidebar } from '@/components/panel-shell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useArticleDashboard } from '@/hooks/use-article';
import { useAdminSellerApplications } from '@/hooks/use-seller-application';
import { authClient } from '@/lib/auth/auth-client';
import { BookOpen, LayoutDashboard, Package } from 'lucide-react';

export function AdminSidebar() {
  const { data: session } = authClient.useSession();
  const { data: articleDashboard } = useArticleDashboard();
  const { data: pendingApplications } = useAdminSellerApplications('pending');

  const adminName = session?.user?.name ?? 'Admin WastraNusa';
  const adminRole = session?.user?.role === 'admin' ? 'Administrator' : 'Staf';

  return (
    <PanelSidebar
      label="Panel Admin"
      nav={[
        { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        {
          title: 'Artikel',
          href: '/admin/article',
          icon: BookOpen,
          count: articleDashboard?.totalArticles,
        },
        {
          title: 'Manajemen Penjual',
          href: '/admin/seller-management',
          icon: Package,
          count: pendingApplications?.length,
        },
      ]}
      profile={
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3">
          <Avatar size="sm" className="size-9">
            <AvatarFallback className="bg-[#d2a36d] font-semibold text-sidebar-foreground">
              {adminName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {adminName}
            </p>
            <p className="text-xs text-sidebar-foreground/75">{adminRole}</p>
          </div>
        </div>
      }
    />
  );
}
