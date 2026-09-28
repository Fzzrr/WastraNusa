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
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
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
    'flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
    item.active && 'bg-white/10 text-[#e08a55] hover:text-[#e08a55]',
    item.disabled && 'pointer-events-none opacity-50',
  );

  if (item.href && !item.disabled) {
    return (
      <Link href={item.href} className={className}>
        <Icon className="size-[18px]" />
        <span>{item.title}</span>
      </Link>
    );
  }

  return (
    <button type="button" disabled className={className}>
      <Icon className="size-[18px]" />
      <span className="flex-1 text-left">{item.title}</span>
      {item.disabled ? (
        <span className="rounded-full bg-[#d2a36d]/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#e3bf8c]">
          Segera Hadir
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
  const isAdmin = session?.user?.role === 'admin';

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
          <p className="text-sm text-[#d2a36d]">Panel Penjual</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-5">
        <nav className="space-y-1">
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
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <ShieldCheck className="size-4" />
              <span>Panel Admin</span>
            </Link>
          ) : null}
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
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3 transition-colors hover:bg-white/12"
        >
          <Avatar size="sm" className="size-9">
            <AvatarFallback className="bg-[#d2a36d] font-semibold text-[#3a2f16]">
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
