'use client';

import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { type DashboardData, type DashboardNavItem } from '@/types/dashboard';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Package,
  Package2,
  ShoppingBag,
  Store,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigationIcons = {
  Dashboard: LayoutDashboard,
  Artikel: BookOpen,
  'Seller Management': Package,
  'Produk & Inventori': Package2,
  Pesanan: ShoppingBag,
} as const;

const ADMIN_NAVIGATION = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Artikel', href: '/admin/article' },
  { title: 'Seller Management', href: '/admin/seller-management' },
  // deprecated: superseded by seller panel
  // { title: 'Produk & Inventori', href: '/admin/product-inventory' },
  // { title: 'Pesanan', href: '/admin/pesanan' },
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
    item.active && 'bg-white/10 text-[#e08a55] hover:text-[#e08a55]',
    item.disabled && 'pointer-events-none opacity-50',
  );
  const content = (
    <>
      <Icon className="size-[18px]" />
      <span className="flex-1">{item.title}</span>
      {count ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            item.active
              ? 'bg-[#e08a55]/20 text-[#e08a55]'
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

function AdminSidebarContent({
  navCounts,
}: {
  data: Partial<DashboardData>;
  navCounts?: NavCounts;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const adminName = session?.user?.name ?? 'Admin WastraNusa';
  const adminRole = session?.user?.role === 'admin' ? 'Super User' : 'Staff';

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
          <p className="text-sm text-[#d2a36d]">Panel Admin</p>
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
            href="/profile/seller-application"
            className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Store className="size-4" />
            <span>Toko Saya</span>
          </Link>
          <Link
            href="/"
            className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <UserRound className="size-4" />
            <span>Halaman Pengguna</span>
          </Link>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Keluar</span>
          </Button>
        </nav>
        <div className="h-px bg-white/10" />
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
      </div>
    </div>
  );
}

export function AdminSidebar({
  data,
  navCounts,
}: {
  data: Partial<DashboardData>;
  navCounts?: NavCounts;
}) {
  const { open, setOpen } = useAdminSidebar();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 bg-sidebar md:block">
        <AdminSidebarContent data={data} navCounts={navCounts} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[var(--sidebar-width)] max-w-[85%] border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <AdminSidebarContent data={data} navCounts={navCounts} />
        </SheetContent>
      </Sheet>
    </>
  );
}
