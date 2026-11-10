'use client';

import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useEffect, useState } from 'react';

const HOLD_MS = 6000;

/** Only URLs next/image can load (local paths or https). */
function hasRenderableImage(article: EncyclopediaArticle) {
  const url = article.imageURL;
  return Boolean(url && (url.startsWith('/') || url.startsWith('https://')));
}

/**
 * Encyclopedia masthead, set like the opening spread of a book: the title on
 * the page's own ground, and one large photograph that slowly crossfades
 * through the articles, its caption naming the article it shows.
 */
export function EncyclopediaHero({
  articles,
  children,
}: {
  /** Articles to show; those without a usable image are skipped. */
  articles: EncyclopediaArticle[];
  /** Figures shown at the foot of the text column. */
  children?: ReactNode;
}) {
  const slides = articles.filter(hasRenderableImage).slice(0, 6);
  const [active, setActive] = useState(0);
  const current = slides[active % Math.max(slides.length, 1)];

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      // Hold still while the tab is in the background.
      if (!document.hidden) setActive((index) => index + 1);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
      <div className="flex flex-col lg:justify-center">
        <h1 className="animate-in text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-ink duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
          Ensiklopedia
          <br />
          <span className="text-brand">wastra</span>
        </h1>
        <p className="mt-6 max-w-sm animate-in text-lg leading-relaxed text-ink-soft delay-100 duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
          Teknik, motif, dan makna di balik kain Nusantara.
        </p>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>

      {current ? (
        <figure className="animate-in duration-700 fade-in">
          <Link
            href={`/encyclopedia/${current.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden bg-surface outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-ground"
          >
            {slides.map((slide, index) => (
              <Image
                key={slide.slug}
                src={slide.imageURL as string}
                alt={slide.title}
                fill
                sizes="(min-width: 1024px) 680px, 100vw"
                preload={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`object-cover transition-[opacity,scale] duration-[1600ms] ease-out group-hover:scale-[1.02] ${
                  slide.slug === current.slug ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </Link>
          <figcaption className="mt-4 flex items-start justify-between gap-6">
            <Link
              key={current.slug}
              href={`/encyclopedia/${current.slug}`}
              className="group min-w-0 animate-in duration-700 fade-in"
            >
              <span className="flex items-center gap-2 text-xl leading-snug font-semibold text-ink group-hover:underline group-hover:underline-offset-4">
                {current.title}
                <ArrowRight className="size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[15px] text-ink-soft">
                <MapPin className="size-4 shrink-0" strokeWidth={1.75} />
                {current.region}
              </span>
            </Link>

            {slides.length > 1 ? (
              <div className="flex shrink-0 gap-1 pt-2">
                {slides.map((slide, index) => {
                  const isActive = slide.slug === current.slug;
                  return (
                    <button
                      key={slide.slug}
                      type="button"
                      aria-label={`Tampilkan ${slide.title}`}
                      aria-current={isActive}
                      onClick={() => setActive(index)}
                      className="grid h-6 cursor-pointer place-items-center px-1"
                    >
                      <span
                        className={`block h-[3px] transition-all duration-300 ${
                          isActive
                            ? 'w-8 bg-brand'
                            : 'w-4 bg-border hover:bg-ink-soft'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </figcaption>
        </figure>
      ) : (
        <div className="aspect-[4/3] bg-surface" />
      )}
    </div>
  );
}
