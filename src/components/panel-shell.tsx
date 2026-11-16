'use client';

import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, type LucideIcon, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, createContext, useContext, useState } from 'react';

type PanelSidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PanelSidebarContext = createContext<PanelSidebarContextValue | null>(
  null,
);

/** Mobile-drawer state of the admin/seller sidebar. */
export function usePanelSidebar() {
  const context = useContext(PanelSidebarContext);
  if (!context) {
    throw new Error('usePanelSidebar must be used within a PanelShell');
  }
  return context;
}

const SIDEBAR_THEME = {
  '--sidebar-width': '18.5rem',
  '--sidebar': '#305645',
  '--sidebar-foreground': '#f4efe2',
  '--sidebar-border': 'rgba(255, 255, 255, 0.08)',
  '--sidebar-accent': 'rgba(255, 255, 255, 0.08)',
  '--sidebar-accent-foreground': '#ffffff',
  '--sidebar-primary': '#4b6f5f',
  '--sidebar-primary-foreground': '#ffffff',
  '--sidebar-ring': 'rgba(231, 184, 109, 0.4)',
} as React.CSSProperties;

/** Page frame shared by the admin and seller panels: sidebar + content. */
export function PanelShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  // Remember which page the drawer was opened on: navigating away closes it
  // without an effect.
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);

  return (
    <PanelSidebarContext.Provider value={{ open, setOpen }}>
      <div
        style={SIDEBAR_THEME}
        className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_28%),linear-gradient(180deg,_#f4ede2_0%,_#efe7db_100%)]"
      >
        {sidebar}
        <div className="min-h-screen min-w-0 flex-1 bg-transparent">
          <div className="flex min-h-screen flex-col">{children}</div>
        </div>
      </div>
    </PanelSidebarContext.Provider>
  );
}

export type PanelNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Badge shown next to the title when > 0. */
  count?: number;
};

function PanelNavLink({
  item,
  active,
}: {
  item: PanelNavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        active && 'bg-white/10 text-[#e08a55] hover:text-[#e08a55]',
      )}
    >
      <Icon className="size-[18px]" />
      <span className="flex-1">{item.title}</span>
      {item.count ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            active
              ? 'bg-[#e08a55]/20 text-[#e08a55]'
              : 'bg-white/15 text-sidebar-foreground/80',
          )}
        >
          {item.count}
        </span>
      ) : null}
    </Link>
  );
}

type PanelSidebarProps = {
  /** Subtitle under the logo, e.g. "Panel Admin". */
  label: string;
  nav: PanelNavItem[];
  /** Identity card at the bottom (who is signed in). */
  profile: ReactNode;
};

function PanelSidebarContent({ label, nav, profile }: PanelSidebarProps) {
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
          <p className="text-sm text-[#d2a36d]">{label}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-5">
        <nav className="space-y-1">
          {nav.map((item) => (
            <PanelNavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
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
            <span>Keluar</span>
          </Button>
        </nav>
        <div className="h-px bg-white/10" />
        {profile}
      </div>
    </div>
  );
}

/** Sidebar for the admin/seller panels: fixed on desktop, a drawer on mobile. */
export function PanelSidebar(props: PanelSidebarProps) {
  const { open, setOpen } = usePanelSidebar();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 bg-sidebar md:block">
        <PanelSidebarContent {...props} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          // The drawer is portaled out of PanelShell, so re-apply its colors.
          style={SIDEBAR_THEME}
          aria-describedby={undefined}
          className="w-[var(--sidebar-width)] max-w-[85%] border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigasi {props.label}</SheetTitle>
          <PanelSidebarContent {...props} />
        </SheetContent>
      </Sheet>
    </>
  );
}
