'use client';

import { useSellerSidebar } from '@/components/seller/seller-sidebar-context';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function SellerHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { setOpen } = useSellerSidebar();

  return (
    <header className="flex flex-col gap-4 px-4 pt-6 md:px-8 md:pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            aria-label="Buka sidebar"
            variant="outline"
            size="icon-sm"
            className="size-10 border-0 bg-surface text-ink shadow-none md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
              {title}
            </h1>
            <p className="text-base text-ink-soft">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
