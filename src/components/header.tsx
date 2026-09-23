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
import { authClient } from '@/lib/auth/auth-client';
import {
  BookOpenText,
  Grid2X2,
  LayoutDashboard,
  Menu,
  ShoppingCart,
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
  { label: 'Ensiklopedia', icon: BookOpenText, href: '/encyclopedia' },
  { label: 'Catalog', icon: Grid2X2, href: '/catalog' },
  { label: 'Keranjang', icon: ShoppingCart, href: '/cart' },
  { label: 'Profil', icon: UserRound, href: '/profile' },
];

type HeaderProps = {
  homeHref?: string;
};

export function Header({ homeHref = '/' }: HeaderProps) {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === 'admin';
  const pathname = usePathname();
  const showSearch =
    pathname === '/' ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/encyclopedia') ||
    pathname.startsWith('/search');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin,
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
              height={70}
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
              const content = (
                <>
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </>
              );

              const classes =
                'group relative flex flex-col items-center gap-1 text-[#2f4f3f] transition hover:text-[#224233]';

              // Logika ini akan otomatis menangani navigasi ke /cart
              if (href) {
                return (
                  <Link key={label} href={href} className={classes}>
                    {content}
                  </Link>
                );
              }

              return (
                <button key={label} className={classes} type="button">
                  {content}
                </button>
              );
            })}
          </nav>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-[#d8cfbf] text-[#355846] md:hidden"
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
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#2f4f3f] transition hover:bg-[#2f4f3f]/[8%] active:scale-[0.98]"
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
