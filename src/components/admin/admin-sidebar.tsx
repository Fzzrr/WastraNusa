'use client';

import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { type DashboardNavItem } from '@/types/dashboard';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Package,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigationIcons = {
  Dashboard: LayoutDashboard,
  Artikel: BookOpen,
  'Manajemen Penjual': Package,
} as const;

const ADMIN_NAVIGATION = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Artikel', href: '/admin/article' },
  { title: 'Manajemen Penjual', href: '/admin/seller-management' },
];

function SidebarNavigationItem({
  item,
  count,
}: {
  item: DashboardNavItem;
  count?: number;
}) {
  const Icon = navigationIcons[item.title as keyof typeof navigationIcons];
  const className = cn(
    'flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
    item.active && 'bg-white/10 text-gold hover:text-gold',
    item.disabled && 'pointer-events-none opacity-50',
  );
  const content = (
    <>
      <Icon className="size-[18px]" />
      <span className="flex-1">{item.title}</span>
      {count ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[13px] font-medium',
            item.active
              ? 'bg-gold/20 text-gold'
              : 'bg-white/15 text-sidebar-foreground/80',
          )}
        >
          {count}
        </span>
      ) : null}
    </>
  );

  if (item.href && !item.disabled) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" disabled className={className}>
      {content}
    </button>
  );
}

type NavCounts = Partial<Record<string, number>>;

function AdminSidebarContent({ navCounts }: { navCounts?: NavCounts }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const adminName = session?.user?.name ?? 'Admin WastraNusa';
  const adminRole = session?.user?.role === 'admin' ? 'Administrator' : 'Staf';

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.clear();
          router.push('/login');
        },
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="relative size-12 shrink-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="WastraNusa"
            fill
            sizes="48px"
            className="scale-[1.35] object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-sidebar-foreground">
            WastraNusa
          </p>
          <p className="text-base text-gold">Panel Admin</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-5">
        <nav className="space-y-1">
          {ADMIN_NAVIGATION.map((item) => (
            <SidebarNavigationItem
              key={item.title}
              item={{ ...item, active: pathname === item.href }}
              count={navCounts?.[item.title]}
            />
          ))}
        </nav>
      </div>

      <div className="space-y-3 px-3 pb-4">
        <nav className="space-y-2">
          <Link
            href="/"
            className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <UserRound className="size-4" />
            <span>Halaman Pengguna</span>
          </Link>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start gap-2 rounded-full px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Keluar</span>
          </Button>
        </nav>
        <div className="h-px bg-white/10" />
        <div className="flex items-center gap-3 rounded-xl bg-white/8 px-3 py-3">
          <Avatar size="sm" className="size-9">
            <AvatarFallback className="bg-gold font-semibold text-sidebar-foreground">
              {adminName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-sidebar-foreground">
              {adminName}
            </p>
            <p className="text-[13px] text-sidebar-foreground/75">
              {adminRole}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ navCounts }: { navCounts?: NavCounts }) {
  const { open, setOpen } = useAdminSidebar();

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[var(--sidebar-width)] shrink-0 bg-sidebar md:block">
        <AdminSidebarContent navCounts={navCounts} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[var(--sidebar-width)] max-w-[85%] border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <AdminSidebarContent navCounts={navCounts} />
        </SheetContent>
      </Sheet>
    </>
  );
}
