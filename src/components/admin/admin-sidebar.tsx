'use client';

import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { type DashboardData, type DashboardNavItem } from '@/types/dashboard';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Package2,
  ShoppingBag,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigationIcons = {
  Dashboard: LayoutDashboard,
  Article: BookOpen,
  'Produk & Inventori': Package2,
  Pesanan: ShoppingBag,
} as const;

const ADMIN_NAVIGATION = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Article', href: '/admin/article' },
  { title: 'Produk & Inventori', href: '/admin/product-inventory' },
  { title: 'Pesanan', href: '/admin/pesanan' },
];

function SidebarNavigationItem({ item }: { item: DashboardNavItem }) {
  const Icon = navigationIcons[item.title as keyof typeof navigationIcons];
  const className = cn(
    'flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
    item.active && 'bg-[#4b6f5f] text-[#C0653B]',
    item.disabled && 'pointer-events-none opacity-50',
  );

  if (item.href && !item.disabled) {
    return (
      <Link href={item.href} className={className}>
        <Icon className="size-4" />
        <span>{item.title}</span>
      </Link>
    );
  }

  return (
    <button type="button" disabled className={className}>
      <Icon className="size-4" />
      <span>{item.title}</span>
    </button>
  );
}

function AdminSidebarContent({ data }: { data: Partial<DashboardData> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const stockAlerts = data.stockAlerts ?? [];
  const outOfStockCount = stockAlerts.filter(
    (item) => item.stockLabel === 'Habis',
  ).length;
  const criticalStockCount = stockAlerts.filter(
    (item) => item.stockLabel === 'Kritis',
  ).length;
  const lowStockCount = stockAlerts.filter((item) =>
    item.stockLabel.startsWith('Rendah'),
  ).length;

  const adminName = session?.user?.name ?? 'Admin WastraNusa';
  const adminRole = session?.user?.role === 'admin' ? 'Super User' : 'Staff';

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#416d59] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
            W
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              WastraNusa
            </p>
            <p className="text-xs text-sidebar-foreground/75">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <nav className="space-y-2">
          {ADMIN_NAVIGATION.map((item) => (
            <SidebarNavigationItem
              key={item.title}
              item={{ ...item, active: pathname === item.href }}
            />
          ))}
        </nav>

        {(outOfStockCount > 0 ||
          criticalStockCount > 0 ||
          lowStockCount > 0) && (
          <Alert className="mt-6 border-0 bg-[#7d4e46] text-[#faeee1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <TriangleAlert />
            <AlertTitle>Peringatan Stok</AlertTitle>
            <AlertDescription className="text-[#f0d5c8] [&_p:not(:last-child)]:mb-1">
              <p>{outOfStockCount} Produk Habis</p>
              <p>{criticalStockCount} Produk Kritis</p>
              <p>{lowStockCount} Produk Rendah</p>
            </AlertDescription>
          </Alert>
        )}
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
            className="h-10 w-full justify-start gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
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

export function AdminSidebar({ data }: { data: Partial<DashboardData> }) {
  const { open, setOpen } = useAdminSidebar();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 bg-sidebar md:block">
        <AdminSidebarContent data={data} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[var(--sidebar-width)] max-w-[85%] border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <AdminSidebarContent data={data} />
        </SheetContent>
      </Sheet>
    </>
  );
}
