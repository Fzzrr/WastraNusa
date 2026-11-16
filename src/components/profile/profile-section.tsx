import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Card surface shared by every profile page. */
export const profileCardClassName =
  'rounded-2xl bg-[#fffdf8] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#e8dfd0]';

/** Titled profile card: gold icon chip, green title, optional right-side aside. */
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
      <header className="flex flex-col gap-3 border-b border-[#efe8dd] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d] shadow-[0_6px_14px_-8px_rgba(47,75,61,0.8)]">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#2f4f3f]">{title}</h2>
            {description ? (
              <p className="text-xs text-[#9a8f80]">{description}</p>
            ) : null}
          </div>
        </div>
        {aside}
      </header>
      <div className={cn('p-5 md:p-6', bodyClassName)}>{children}</div>
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e0d6c6] bg-[#faf7f2] px-6 py-12 text-center">
      <span
        className={cn(
          'grid size-14 place-items-center rounded-full',
          tone === 'error'
            ? 'bg-[#f6e1dd] text-[#b04a3a]'
            : 'bg-[#f5ead3] text-[#b08a5e]',
        )}
      >
        <Icon className="size-7" />
      </span>
      <div>
        <p className="font-semibold text-[#3d4f45]">{title}</p>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-[#9a8f80]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Primary green gradient button styling used across profile pages. */
export const profilePrimaryButtonClassName =
  'cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-white shadow-[0_8px_18px_-10px_rgba(47,95,73,0.8)] transition-all hover:-translate-y-px hover:from-[#274e3c] hover:to-[#35644d] hover:text-white';

/** Quiet outline button styling used across profile pages. */
export const profileOutlineButtonClassName =
  'cursor-pointer gap-1.5 rounded-xl border-[#e3d9c7] bg-white text-[#4d6356] transition-colors hover:border-[#2f5f49]/40 hover:bg-[#e3ece5] hover:text-[#2f5f49]';
