'use client';

import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  LogOut,
  type LucideIcon,
  MapPin,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const NAV_ITEMS: {
  icon: LucideIcon;
  label: string;
  href: string;
  // Admins can shop like any user but can't run a shop.
  hideForAdmin?: boolean;
}[] = [
  { icon: User, label: 'Profil Saya', href: '/profile' },
  { icon: ShoppingBag, label: 'Pesanan Saya', href: '/profile/my-order' },
  { icon: MapPin, label: 'Alamat Tersimpan', href: '/profile/saved-address' },
  { icon: BookOpen, label: 'Artikel Disukai', href: '/profile/liked-article' },
  {
    icon: Store,
    label: 'Buka Toko',
    href: '/profile/seller-application',
    hideForAdmin: true,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const navRef = useRef<HTMLElement>(null);
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === 'admin';

  // On phones the menu is a horizontal scroll row: centre the current page's
  // pill. scrollLeft only moves the row, never the page.
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft =
      current.offsetLeft - (nav.clientWidth - current.clientWidth) / 2;
  }, [pathname]);

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

  // Nested pages (e.g. an order detail) keep their parent item highlighted.
  const isActive = (href: string) =>
    href === '/profile' ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      ref={navRef}
      aria-label="Menu profil"
      // Phones: one scrollable row of labelled pills. md+: the vertical list.
      className="relative flex w-full flex-row gap-1 overflow-x-auto [scrollbar-width:none] md:sticky md:top-6 md:w-[220px] md:flex-col md:self-start md:overflow-visible lg:w-[240px]"
    >
      {NAV_ITEMS.filter((item) => !(isAdmin && item.hideForAdmin)).map(
        ({ icon: Icon, label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex h-11 flex-none items-center gap-3 rounded-full px-4 text-[15px] whitespace-nowrap transition-colors duration-200 active:scale-[0.98] md:justify-start',
                active
                  ? 'bg-brand font-semibold text-on-field'
                  : 'text-ink hover:bg-surface',
              )}
            >
              <Icon
                className={cn(
                  'size-5 shrink-0',
                  active ? 'text-on-field' : 'text-ink-soft',
                )}
                strokeWidth={1.75}
              />
              <span className="flex-1">{label}</span>
            </Link>
          );
        },
      )}

      <div className="hidden md:block md:h-4" />

      <button
        type="button"
        onClick={handleSignOut}
        className="group flex h-11 flex-none cursor-pointer items-center gap-3 rounded-full px-4 text-[15px] whitespace-nowrap text-destructive transition-colors hover:bg-destructive/10 md:justify-start"
      >
        <LogOut className="size-5 shrink-0" strokeWidth={1.75} />
        <span>Keluar</span>
      </button>
    </nav>
  );
}
