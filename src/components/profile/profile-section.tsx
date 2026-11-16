import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Card surface shared by every profile page. */
export const profileCardClassName = 'rounded-xl bg-card';

/** Titled profile card: icon, title, optional right-side aside. */
export function ProfileSection({
  icon: Icon,
  title,
  description,
  aside,
  children,
  className,
  bodyClassName,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        profileCardClassName,
        'animate-in overflow-hidden duration-500 fade-in slide-in-from-bottom-2',
        className,
      )}
    >
      <header className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between md:px-7 md:pt-7">
        <div className="flex items-center gap-3">
          <Icon className="shrink-0 size-5 text-brand" strokeWidth={1.75} />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            {description ? (
              <p className="text-[15px] text-ink-soft">{description}</p>
            ) : null}
          </div>
        </div>
        {aside}
      </header>
      <div className={cn('p-5 md:p-7', bodyClassName)}>{children}</div>
    </section>
  );
}

/** Friendly empty/error state with an icon and optional call to action. */
export function ProfileEmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface px-6 py-12 text-center">
      <Icon
        className={cn(
          'size-8',
          tone === 'error' ? 'text-destructive' : 'text-ink-soft',
        )}
        strokeWidth={1.5}
      />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mt-1 max-w-sm text-base text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Primary button styling used across profile pages. */
export const profilePrimaryButtonClassName =
  'cursor-pointer gap-2 rounded-full bg-brand font-semibold text-on-field transition-colors hover:bg-brand-strong hover:text-on-field';

/** Quiet secondary button styling used across profile pages. */
export const profileOutlineButtonClassName =
  'cursor-pointer gap-1.5 rounded-full border-0 bg-surface font-semibold text-ink transition-colors hover:bg-border hover:text-ink';
