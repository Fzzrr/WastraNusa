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

const menuItems = [
  {
    label: 'Admin',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    adminOnly: true,
  },
  // Sellers go straight to their panel; admins land on "Buka Toko", which
  // shows the panel button once their shop exists (or the form otherwise).
  { label: 'Toko', icon: Store, href: '/seller/dashboard', sellerOnly: true },
  { label: 'Ensiklopedia', icon: BookOpenText, href: '/encyclopedia' },
  { label: 'Katalog', icon: Grid2X2, href: '/catalog' },
  { label: 'Keranjang', icon: ShoppingCart, href: '/cart' },
  { label: 'Profil', icon: UserRound, href: '/profile' },
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
      className="absolute -top-2 -right-2.5 grid h-4 min-w-4 animate-in place-items-center rounded-full bg-[#b35d2f] px-1 text-xs leading-none font-bold text-white tabular-nums zoom-in-50 duration-300 motion-reduce:animate-none"
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
    .filter((item) => !item.sellerOnly || isSeller || isAdmin)
    .map((item) =>
      item.sellerOnly && !isSeller
        ? { ...item, href: '/profile/seller-application' }
        : item,
    );

  return (
    <header className="border-b-4 border-[#2F4F3F] bg-[#f9f7f2]">
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="flex h-20 items-center gap-4">
          <Link href={homeHref} className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="WastraNusa"
              width={60}
              height={60}
              priority
              className="object-contain"
            />
            <span className="text-2xl font-extrabold tracking-tight text-[#2f5f49]">
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

          <nav className="ml-auto hidden items-center gap-5 md:flex lg:gap-6">
            {visibleMenuItems.map(({ label, icon: Icon, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex flex-col items-center gap-1 py-1 text-[#2f4f3f] transition hover:text-[#224233]',
                    // Underline grows in on hover and stays on the current page.
                    "after:absolute after:-bottom-1 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:scale-x-0 after:rounded-full after:bg-[#b35d2f] after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-50",
                    active &&
                      'font-semibold after:scale-x-100 hover:after:scale-x-100',
                  )}
                >
                  <div className="relative transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Icon className="h-4 w-4" />
                    {href === '/cart' ? <CartBadge count={cartCount} /> : null}
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/cart"
            aria-label={
              cartCount > 0 ? `Keranjang, ${cartCount} produk` : 'Keranjang'
            }
            className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-[#d8cfbf] text-[#355846] transition active:scale-95 md:hidden"
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              <CartBadge count={cartCount} />
            </span>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8cfbf] text-[#355846] md:hidden"
                type="button"
                aria-label="Buka menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#f9f7f2]">
              <SheetHeader className="border-b border-[#e4dccd]">
                <SheetTitle className="text-[#2f5f49]">Menu</SheetTitle>
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
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-[#2f4f3f] transition hover:bg-[#2f4f3f]/[8%] active:scale-[0.98]',
                        isActive(href) && 'bg-[#2f4f3f]/[8%] font-semibold',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{label}</span>
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
