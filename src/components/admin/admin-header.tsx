'use client';

import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';

/** "WastraNusa Admin" note used in plain-header subtitles. */
export function AdminBrandChip() {
  return <span className="text-[15px] text-ink-soft">WastraNusa Admin</span>;
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
        isPlain ? 'pt-6 md:pt-8' : 'bg-card py-4 md:py-6',
      )}
    >
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
            <h1
              className={cn(
                isPlain
                  ? 'text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em] text-ink'
                  : 'text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl',
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <div
                className={cn(
                  isPlain
                    ? 'text-base text-ink-soft'
                    : 'text-[15px] text-ink-soft',
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
