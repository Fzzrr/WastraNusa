'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import { cn } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import { ArrowRight, Home, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { formatVariantPriceRange } from '../utils';

const HOLD_MS = 5000;
const SPOTLIGHT_COUNT = 5;

/** Only URLs next/image can load (local paths or https). */
function hasRenderableImage(product: ProductInventoryItem) {
  const url = product.imageURL;
  return Boolean(url && (url.startsWith('/') || url.startsWith('https://')));
}

/**
 * Catalog masthead set like a shop window: the newest pieces take turns in
 * the light, each with its price and a way in, and a row of thumbnails lets
 * the visitor pick which one to look at. Filtering stays in the sidebar below.
 */
export function CatalogMainHeader() {
  // Newest few, independent of the filters below.
  const { data } = useProductCatalog(1, 12, { sortBy: 'newest' });
  const pieces = useMemo(
    () =>
      (data?.items ?? []).filter(hasRenderableImage).slice(0, SPOTLIGHT_COUNT),
    [data?.items],
  );
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const current = pieces[active % Math.max(pieces.length, 1)];

  const totalProducts =
    data?.meta.stats?.totalProducts ?? data?.meta.totalItems ?? 0;
  const totalIslands =
    data?.meta.stats?.totalIslands ?? data?.meta.islands?.length ?? 0;

  useEffect(() => {
    if (pieces.length < 2 || isPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => index + 1);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [pieces.length, isPaused]);

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 pt-6 md:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList className="text-[15px] text-ink-soft">
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="flex items-center gap-1.5 hover:text-ink"
            >
              <Home className="size-3.5" />
              Beranda
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-ink">Katalog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div
        className="mt-4 grid overflow-hidden bg-field text-on-field lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <div className="flex flex-col px-5 pt-8 pb-8 md:px-12 md:pt-12 md:pb-10">
          <h1 className="animate-in text-[clamp(2.5rem,5.4vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.04em] duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
            Katalog wastra
          </h1>
          <p className="mt-4 text-base text-on-field-soft md:text-lg">
            {totalProducts > 0
              ? `${totalProducts} karya dari ${totalIslands} pulau, langsung dari pengrajinnya.`
              : 'Langsung dari pengrajinnya.'}
          </p>

          {current ? (
            <div className="mt-10 lg:mt-auto">
              <div
                key={current.slug}
                className="animate-in duration-500 fade-in"
              >
                <p className="text-[clamp(1.5rem,2.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.025em]">
                  {current.name}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[15px] text-on-field-soft">
                  <MapPin className="size-4 shrink-0" strokeWidth={1.75} />
                  {current.province}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <p className="text-[clamp(1.5rem,2.2vw,2rem)] font-semibold tracking-[-0.02em] tabular-nums">
                    {formatVariantPriceRange(current.variants, current.price)}
                  </p>
                  <Link
                    href={`/catalog/${current.slug}`}
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-ground px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-white"
                  >
                    Lihat produk
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {pieces.length > 1 ? (
                <div
                  role="group"
                  aria-label="Pilih produk yang disorot"
                  className="mt-8 flex gap-2"
                >
                  {pieces.map((piece, index) => {
                    const isActive = piece.slug === current.slug;
                    return (
                      <button
                        key={piece.slug}
                        type="button"
                        aria-label={piece.name}
                        aria-pressed={isActive}
                        onClick={() => setActive(index)}
                        className={cn(
                          'relative size-14 cursor-pointer overflow-hidden transition-opacity duration-300 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:size-16',
                          isActive
                            ? 'opacity-100 outline-2 outline-offset-2 outline-gold'
                            : 'opacity-55 hover:opacity-100',
                        )}
                      >
                        <Image
                          src={piece.imageURL as string}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-10 space-y-3 lg:mt-auto">
              <span className="block h-8 w-2/3 animate-pulse bg-white/10" />
              <span className="block h-6 w-1/3 animate-pulse bg-white/10" />
            </div>
          )}
        </div>

        <Link
          href={current ? `/catalog/${current.slug}` : '/catalog'}
          aria-hidden
          tabIndex={-1}
          className="relative order-first block aspect-[4/3] bg-black/20 lg:order-none lg:aspect-auto"
        >
          {pieces.map((piece) => (
            <Image
              key={piece.slug}
              src={piece.imageURL as string}
              alt=""
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
              className={cn(
                'object-cover transition-[opacity,scale] duration-[1200ms] ease-out',
                piece.slug === current?.slug
                  ? 'scale-100 opacity-100'
                  : 'scale-[1.04] opacity-0',
              )}
            />
          ))}
        </Link>
      </div>
    </section>
  );
}
