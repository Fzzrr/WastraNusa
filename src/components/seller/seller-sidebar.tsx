'use client';

import { useSellerSidebar } from '@/components/seller/seller-sidebar-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { type DashboardNavItem } from '@/types/dashboard';
import { useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package2,
  Store,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigationIcons = {
  Dashboard: LayoutDashboard,
  'Produk & Inventori': Package2,
  Pesanan: ClipboardList,
  'Live Chat': MessageCircle,
} as const;

const SELLER_NAVIGATION: DashboardNavItem[] = [
  { title: 'Dashboard', href: '/seller/dashboard' },
  { title: 'Produk & Inventori', href: '/seller/product-inventory' },
  { title: 'Pesanan', href: '/seller/pesanan' },
  // Live Chat is intentionally deferred — rendered disabled ("Segera hadir").
  { title: 'Live Chat', disabled: true },
];

function SidebarNavigationItem({ item }: { item: DashboardNavItem }) {
  const Icon = navigationIcons[item.title as keyof typeof navigationIcons];
  const className = cn(
    'flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
    item.active && 'bg-[#4a6b3a] text-[#f2e7c9]',
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
      <span className="flex-1 text-left">{item.title}</span>
      {item.disabled ? (
        <span className="rounded-full bg-[#d9b061]/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#e7c98c]">
          Segera hadir
        </span>
      ) : null}
    </button>
  );
}

function SellerSidebarContent({ shopName }: { shopName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const sellerName = session?.user?.name ?? 'Seller WastraNusa';

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
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#4a6b3a] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
            W
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              WastraNusa Seller Panel
            </p>
            <p className="text-xs text-sidebar-foreground/75">Pusat Penjual</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <nav className="space-y-2">
          {SELLER_NAVIGATION.map((item) => (
            <SidebarNavigationItem
              key={item.title}
              item={{ ...item, active: pathname === item.href }}
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
            className="h-10 w-full justify-start gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </Button>
        </nav>
        <div className="h-px bg-white/10" />
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3 transition-colors hover:bg-white/12"
        >
          <Avatar size="sm" className="size-9">
            <AvatarFallback className="bg-[#d9b061] font-semibold text-[#3a2f16]">
              <Store className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {shopName || sellerName}
            </p>
            <p className="text-xs text-sidebar-foreground/75">
              · Lihat profil toko
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function SellerSidebar({ shopName }: { shopName: string }) {
  const { open, setOpen } = useSellerSidebar();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 bg-sidebar md:block">
        <SellerSidebarContent shopName={shopName} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[var(--sidebar-width)] max-w-[85%] border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SellerSidebarContent shopName={shopName} />
        </SheetContent>
      </Sheet>
    </>
  );
}
