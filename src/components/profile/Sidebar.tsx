'use client';

import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronRight,
  LogOut,
  type LucideIcon,
  MapPin,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: User, label: 'Profil Saya', href: '/profile' },
  { icon: ShoppingBag, label: 'Pesanan Saya', href: '/profile/my-order' },
  { icon: MapPin, label: 'Alamat Tersimpan', href: '/profile/saved-address' },
  { icon: BookOpen, label: 'Artikel Disukai', href: '/profile/liked-article' },
  { icon: Store, label: 'Buka Toko', href: '/profile/seller-application' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

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
      aria-label="Menu profil"
      className="flex w-full flex-row flex-wrap gap-1 rounded-2xl bg-[#fffdf8] p-2 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#e8dfd0] md:sticky md:top-6 md:w-[220px] md:flex-col md:self-start lg:w-[240px]"
    >
      <p className="hidden px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-[#9a8f80] uppercase md:block">
        Akun Saya
      </p>
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex flex-auto items-center justify-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-all duration-200 md:flex-none md:justify-start',
              active
                ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(47,95,73,0.8)] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-[#e8cb8d]'
                : 'text-[#4d6356] hover:bg-[#e3ece5] hover:text-[#2f5f49]',
            )}
          >
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-lg transition-colors',
                active
                  ? 'bg-white/15 text-[#e8cb8d]'
                  : 'bg-[#f5ead3] text-[#a07a2c] group-hover:bg-white',
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="hidden flex-1 sm:inline">{label}</span>
            <ChevronRight
              className={cn(
                'hidden size-4 transition-all md:block',
                active
                  ? 'text-[#e8cb8d]'
                  : '-translate-x-1 text-[#b3aa9e] opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
              )}
            />
          </Link>
        );
      })}

      <div className="mx-2 my-1 hidden h-px bg-[#efe8dd] md:block" />

      <button
        type="button"
        onClick={handleSignOut}
        className="group flex flex-auto cursor-pointer items-center justify-center gap-2.5 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap text-[#b04a3a] transition-colors hover:bg-[#f6e1dd] md:flex-none md:justify-start"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#f6e1dd] transition-colors group-hover:bg-white">
          <LogOut className="size-4" />
        </span>
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </nav>
  );
}
