import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { type ReactNode, useId } from 'react';

/**
 * Faint kawung batik motif. Absolutely positioned and non-interactive, so it
 * decorates a section without affecting its layout; set size/colour/opacity
 * via `className`.
 */
export function KawungPattern({ className }: { className?: string }) {
  const patternId = useId();

  return (
    <svg aria-hidden className={cn('pointer-events-none absolute', className)}>
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
  );
}

const COLLAGE_LAYOUT = [
  // [position, rotation] for up to three fanned photos.
  'right-[34%] top-6 h-44 w-36 -rotate-6 group-hover/collage:-translate-x-3 group-hover/collage:-rotate-9',
  'right-[8%] top-2 z-10 h-56 w-44 rotate-2 group-hover/collage:-translate-y-2',
  'right-0 bottom-4 h-40 w-32 rotate-[8deg] group-hover/collage:translate-x-2 group-hover/collage:rotate-12',
];

/** Only URLs next/image can load (local paths or https). */
function isRenderableImage(url?: string | null): url is string {
  return Boolean(url && (url.startsWith('/') || url.startsWith('https://')));
}

/**
 * Hero panel shared by public listing pages (Ensiklopedia, Katalog): deep
 * green gradient with a faint kawung motif, a fanned photo collage on wide
 * screens, and glass stat cards passed as `children`.
 */
export function WastraHeroPanel({
  eyebrow,
  title,
  accent,
  description,
  images = [],
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  /** Word rendered after `title` with the gold gradient. */
  accent: string;
  description: ReactNode;
  /** Photos for the collage (first three renderable URLs are used). */
  images?: Array<string | null | undefined>;
  /** Shown below the text, full width (e.g. stat cards). */
  children?: ReactNode;
  className?: string;
}) {
  const collage = [...new Set(images.filter(isRenderableImage))].slice(0, 3);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d3a2d] via-[#2a5541] to-[#3a6a52] px-5 pt-7 pb-5 text-[#f2f7ef] shadow-[0_30px_60px_-34px_rgba(15,41,28,0.9)] md:px-10 md:pt-10 md:pb-8',
        className,
      )}
    >
      <KawungPattern className="inset-0 size-full text-[#e8cb8d] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]" />
      <span className="pointer-events-none absolute -top-28 right-1/4 size-80 rounded-full bg-[#e8cb8d]/15 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-[#7fb89a]/10 blur-3xl" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8cb8d]/50 to-transparent" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
        <div>
          <span className="inline-flex animate-in items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#f3dfb4] ring-1 ring-[#e8cb8d]/30 backdrop-blur duration-500 fade-in slide-in-from-bottom-1">
            <Sparkles className="size-3.5 text-[#e8cb8d]" />
            {eyebrow}
          </span>
          <h1 className="mt-4 animate-in text-4xl font-bold tracking-tight text-[#f7f2e7] duration-500 fill-mode-both fade-in slide-in-from-bottom-2 sm:text-5xl lg:text-6xl">
            {title}{' '}
            <span className="bg-gradient-to-r from-[#f3dfb4] via-[#e8cb8d] to-[#caa86a] bg-clip-text text-transparent">
              {accent}
            </span>
          </h1>
          <div className="mt-4 h-1.5 w-20 origin-left animate-in rounded-full bg-gradient-to-r from-[#e8cb8d] to-[#caa86a] delay-200 duration-700 fill-mode-both zoom-in-0" />
          <p className="mt-4 max-w-2xl animate-in text-base leading-relaxed text-[#c9d9ce] delay-100 duration-500 fill-mode-both fade-in slide-in-from-bottom-2 md:text-lg">
            {description}
          </p>
        </div>

        {collage.length > 0 ? (
          <div
            aria-hidden
            className="group/collage relative hidden h-64 animate-in delay-150 duration-700 fill-mode-both fade-in slide-in-from-right-4 lg:block"
          >
            {collage.map((src, index) => (
              <div
                key={src}
                className={cn(
                  'absolute overflow-hidden rounded-2xl shadow-[0_20px_40px_-18px_rgba(0,0,0,0.7)] ring-4 ring-[#f7f2e7]/90 transition-transform duration-500 ease-out',
                  COLLAGE_LAYOUT[
                    collage.length === 1
                      ? 1
                      : index + (collage.length === 2 ? 1 : 0)
                  ],
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}
