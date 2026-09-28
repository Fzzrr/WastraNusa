import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { type ReactNode, useId } from 'react';

/**
 * Hero panel shared by public listing pages (Ensiklopedia, Katalog): warm
 * gradient, faint kawung batik motif, eyebrow chip and a gradient accent word.
 */
export function WastraHeroPanel({
  eyebrow,
  title,
  accent,
  description,
  aside,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  /** Word rendered after `title` with the green→gold gradient. */
  accent: string;
  description: ReactNode;
  /** Shown beside the text on wide screens (e.g. stat cards). */
  aside?: ReactNode;
  /** Shown below the text, full width. */
  children?: ReactNode;
  className?: string;
}) {
  const patternId = useId();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fbf8f2] via-[#f6f1e7] to-[#efe6d4] px-5 pt-7 pb-5 ring-1 ring-[#e3d9c7] md:px-10 md:pt-10 md:pb-8',
        className,
      )}
    >
      {/* Kawung batik motif, fading out toward the text */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 text-[#2f5b49] opacity-[0.08] [mask-image:linear-gradient(to_left,black_30%,transparent)]"
      >
        <defs>
          <pattern
            id={patternId}
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <ellipse cx="22" cy="9" rx="6" ry="9" fill="currentColor" />
            <ellipse cx="22" cy="35" rx="6" ry="9" fill="currentColor" />
            <ellipse cx="9" cy="22" rx="9" ry="6" fill="currentColor" />
            <ellipse cx="35" cy="22" rx="9" ry="6" fill="currentColor" />
            <circle cx="22" cy="22" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <span className="pointer-events-none absolute -top-24 right-24 size-72 rounded-full bg-[#caa86a]/20 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-[#2f5b49]/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex animate-in items-center gap-1.5 rounded-full bg-[#2f5b49] px-3 py-1 text-xs font-medium text-[#f3ede2] duration-500 fade-in slide-in-from-bottom-1">
              <Sparkles className="size-3.5 text-[#e8cb8d]" />
              {eyebrow}
            </span>
            <h1 className="mt-4 animate-in text-4xl font-bold tracking-tight text-[#2f5b49] duration-500 fill-mode-both fade-in slide-in-from-bottom-2 sm:text-5xl lg:text-6xl">
              {title}{' '}
              <span className="bg-gradient-to-r from-[#2f5b49] via-[#7a8f4e] to-[#caa86a] bg-clip-text text-transparent">
                {accent}
              </span>
            </h1>
            <div className="mt-4 h-1.5 w-20 origin-left animate-in rounded-full bg-gradient-to-r from-[#2f5b49] to-[#caa86a] delay-200 duration-700 fill-mode-both zoom-in-0" />
            <p className="mt-4 max-w-2xl animate-in text-base leading-relaxed text-[#4d6759] delay-100 duration-500 fill-mode-both fade-in slide-in-from-bottom-2 md:text-lg">
              {description}
            </p>
          </div>
          {aside}
        </div>
        {children}
      </div>
    </div>
  );
}
