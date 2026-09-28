'use client';

import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';

/** Green "WastraNusa Admin" pill used in plain-header subtitles. */
export function AdminBrandChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2f5543] px-3 py-1 text-sm font-medium text-[#f4efe2]">
      <span className="size-1.5 rounded-full bg-[#d2a36d]" />
      WastraNusa Admin
    </span>
  );
}

export function AdminHeader({
  title,
  subtitle,
  variant = 'default',
}: {
  title: string;
  subtitle?: ReactNode;
  /** `plain` drops the white bar and uses a larger green title. */
  variant?: 'default' | 'plain';
}) {
  const { setOpen } = useAdminSidebar();
  const isPlain = variant === 'plain';

  return (
    <header
      className={cn(
        'flex flex-col gap-4 px-4 md:px-8',
        isPlain
          ? 'pt-6 md:pt-8'
          : 'border-b border-[#e2d7c8] bg-white py-4 md:py-6',
      )}
    >
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
            <h1
              className={cn(
                'tracking-tight',
                isPlain
                  ? 'text-2xl font-bold text-[#2f5543] md:text-3xl'
                  : 'text-xl font-semibold text-[#4A3A2A] md:text-2xl',
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <div
                className={cn(
                  isPlain
                    ? 'text-base text-[#7d766c]'
                    : 'text-sm text-[#8f8577]',
                )}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
