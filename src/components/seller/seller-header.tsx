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
    <header className="flex flex-col gap-4 border-b border-[#d8e0cc] bg-white px-4 py-4 md:px-8 md:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            aria-label="Open sidebar"
            variant="outline"
            size="icon-sm"
            className="mt-0.5 border-[#cbd6bb] bg-white/80 text-[#4b5a3d] shadow-none md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-[#2f4a2f] md:text-2xl">
              {title}
            </h1>
            <p className="text-sm text-[#7d8a70]">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
