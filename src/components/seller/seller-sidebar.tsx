'use client';

import { PanelSidebar } from '@/components/panel-shell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth/auth-client';
import {
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Package2,
  Store,
} from 'lucide-react';
import Link from 'next/link';

const SELLER_NAVIGATION = [
  { title: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  {
    title: 'Produk & Inventori',
    href: '/seller/product-inventory',
    icon: Package2,
  },
  { title: 'Pesanan', href: '/seller/pesanan', icon: ClipboardList },
  { title: 'Profil Toko', href: '/seller/shop-profile', icon: Store },
  { title: 'Chat Pembeli', href: '/seller/live-chat', icon: MessageCircle },
];

export function SellerSidebar({ shopName }: { shopName: string }) {
  const { data: session } = authClient.useSession();
  const sellerName = session?.user?.name ?? 'Seller WastraNusa';

  return (
    <PanelSidebar
      label="Panel Penjual"
      nav={SELLER_NAVIGATION}
      profile={
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
      }
    />
  );
}
