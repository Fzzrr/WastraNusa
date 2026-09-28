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
            aria-label="Open sidebar"
            variant="outline"
            size="icon-sm"
            className="mt-0.5 border-[#d7cab7] bg-white/80 text-[#5e554a] shadow-none md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#2f5543] md:text-3xl">
              {title}
            </h1>
            <p className="text-base text-[#7d766c]">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
