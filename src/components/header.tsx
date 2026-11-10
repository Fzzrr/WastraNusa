'use client';

import { NavbarSearch } from '@/components/navbar-search';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import {
  BookOpenText,
  Grid2X2,
  LayoutDashboard,
  Menu,
  ShoppingCart,
  Store,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';

// `iconOnly` items are universal symbols (cart, account): on desktop they show
// as the icon alone, with the label kept for screen readers and the tooltip.
const menuItems = [
  {
    label: 'Admin',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    adminOnly: true,
  },
  // Sellers go to their public shop page (which links to the seller panel).
  { label: 'Toko', icon: Store, href: '/shop', sellerOnly: true },
  { label: 'Katalog', icon: Grid2X2, href: '/catalog' },
  { label: 'Ensiklopedia', icon: BookOpenText, href: '/encyclopedia' },
  { label: 'Keranjang', icon: ShoppingCart, href: '/cart', iconOnly: true },
  { label: 'Profil', icon: UserRound, href: '/profile', iconOnly: true },
];

type HeaderProps = {
  homeHref?: string;
};

// Re-keyed on every change so the badge pops when an item is added.
function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      className="absolute -top-2 -right-2.5 grid h-[18px] min-w-[18px] animate-in place-items-center rounded-full bg-brand px-1 text-[13px] leading-none font-semibold text-on-field tabular-nums zoom-in-50 duration-300 motion-reduce:animate-none"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Header({ homeHref = '/' }: HeaderProps) {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === 'admin';
  const isSeller = session?.user?.role === 'seller';
  const pathname = usePathname();
  const showSearch =
    pathname === '/' ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/encyclopedia') ||
    pathname.startsWith('/search');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: cart } = useCart({ enabled: Boolean(session) });
  const cartCount = session ? (cart?.items.length ?? 0) : 0;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const visibleMenuItems = menuItems
    .filter((item) => !item.adminOnly || isAdmin)
    .filter((item) => !item.sellerOnly || isSeller)
    .map((item) =>
      item.sellerOnly ? { ...item, href: `/shop/${session?.user?.id}` } : item,
    );

  return (
    <header className="bg-ground">
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="flex h-[72px] items-center gap-4">
          <Link href={homeHref} className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="WastraNusa"
              width={44}
              height={44}
              priority
              className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-ink">
              WastraNusa
            </span>
          </Link>

          {showSearch ? (
            <div className="hidden flex-1 justify-center px-4 md:flex">
              <Suspense fallback={null}>
                <NavbarSearch className="max-w-xl" />
              </Suspense>
            </div>
          ) : null}

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {visibleMenuItems.map(({ label, icon: Icon, href, iconOnly }) => {
              const active = isActive(href);
              return iconOnly ? (
                <Link
                  key={label}
                  href={href}
                  title={label}
                  aria-label={
                    href === '/cart' && cartCount > 0
                      ? `${label}, ${cartCount} produk`
                      : label
                  }
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface active:scale-95',
                    active && 'bg-surface',
                  )}
                >
                  <span className="relative">
                    <Icon className="size-5" strokeWidth={1.75} />
                    {href === '/cart' ? <CartBadge count={cartCount} /> : null}
                  </span>
                </Link>
              ) : (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2.5 text-[15px] text-ink-soft transition-colors hover:text-ink',
                    active && 'font-semibold text-ink',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/cart"
            aria-label={
              cartCount > 0 ? `Keranjang, ${cartCount} produk` : 'Keranjang'
            }
            className="ml-auto grid size-11 place-items-center rounded-full text-ink transition active:scale-95 active:bg-surface md:hidden"
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              <CartBadge count={cartCount} />
            </span>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="grid size-11 place-items-center rounded-full text-ink transition active:bg-surface md:hidden"
                type="button"
                aria-label="Buka menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-ground">
              <SheetHeader>
                <SheetTitle className="text-ink">Menu</SheetTitle>
              </SheetHeader>
              <div className="px-3">
                <Suspense fallback={null}>
                  <NavbarSearch
                    placeholder="Cari produk atau artikel..."
                    onSubmitted={() => setMobileMenuOpen(false)}
                  />
                </Suspense>
              </div>
              <nav className="flex flex-col gap-1 px-2 pb-4">
                {visibleMenuItems.map(({ label, icon: Icon, href }) => (
                  <SheetClose key={label} asChild>
                    <Link
                      href={href}
                      aria-current={isActive(href) ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-full px-4 py-3 text-ink transition hover:bg-surface active:scale-[0.98]',
                        isActive(href) && 'bg-surface font-semibold',
                      )}
                    >
                      <Icon className="size-5" strokeWidth={1.75} />
                      <span className="text-base">{label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
