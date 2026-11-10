'use client';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { LANDING_ARTICLE_LIMIT, useArticles } from '@/hooks/use-article';
import { cn } from '@/lib/utils';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import {
  ArrowUpRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const navButtonClassName =
  'grid size-11 place-items-center rounded-full bg-surface text-ink transition-colors hover:bg-brand hover:text-on-field active:scale-95 disabled:pointer-events-none disabled:opacity-35';

function IslandCardImage({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Article images are hotlinked; drop dead links instead of showing a broken image.
  const [failed, setFailed] = useState<string[]>([]);
  const usable = images.filter((src) => !failed.includes(src));

  useEffect(() => {
    if (usable.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % usable.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [usable.length]);

  if (usable.length === 0) {
    return <div className="absolute inset-0 bg-field" />;
  }

  return (
    <>
      {usable.map((src, imageIndex) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-1000 ease-out group-hover:scale-105 ${
            imageIndex === activeIndex % usable.length
              ? 'opacity-100'
              : 'opacity-0'
          }`}
          onError={() => setFailed((prev) => [...prev, src])}
        />
      ))}
    </>
  );
}

export function IslandCards() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { data, error, isPending } = useArticles(1, LANDING_ARTICLE_LIMIT);
  const islands =
    data?.meta.islands.filter((island) => island.name !== 'Semua Pulau') ?? [];
  const shouldLoop = islands.length > 5;
  const hasOverflow = canScrollPrev || canScrollNext;

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  const islandImages = useMemo(() => {
    const imagesByIsland = new Map<string, string[]>();
    const articles: EncyclopediaArticle[] = data?.items ?? [];

    for (const article of articles) {
      const island = article.island ?? undefined;
      const imageURL = article.imageURL ?? undefined;

      if (!island || !imageURL) continue;
      const isNextImageSupported =
        imageURL.startsWith('/') || imageURL.startsWith('https://');
      if (!isNextImageSupported) continue;

      const existing = imagesByIsland.get(island) ?? [];
      if (!existing.includes(imageURL)) {
        imagesByIsland.set(island, [...existing, imageURL]);
      }
    }

    return imagesByIsland;
  }, [data?.items]);

  return (
    <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em] text-ink">
          Wastra per pulau
        </h2>

        {hasOverflow ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="Pulau sebelumnya"
              className={navButtonClassName}
              disabled={!canScrollPrev}
              onClick={() => carouselApi?.scrollPrev()}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Pulau berikutnya"
              className={navButtonClassName}
              disabled={!canScrollNext}
              onClick={() => carouselApi?.scrollNext()}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {isPending ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] min-w-[240px] animate-pulse bg-surface"
              />
            ))}
          </div>
        ) : null}

        {!isPending && error ? (
          <p className="bg-surface p-6 text-[15px] text-ink-soft">
            Gagal memuat daftar pulau.
          </p>
        ) : null}

        {!isPending && !error ? (
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: 'start',
              containScroll: 'trimSnaps',
              loop: shouldLoop,
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            {/* Vertical padding keeps the hover lift and shadow from being clipped. */}
            <CarouselContent className="-ml-4">
              {islands.map((island, index) => (
                <CarouselItem
                  key={island.name}
                  className={cn(
                    'basis-[62%] pl-4 sm:basis-1/2',
                    islands.length >= 5
                      ? 'lg:basis-1/3 xl:basis-1/5'
                      : islands.length === 4
                        ? 'lg:basis-1/4'
                        : 'lg:basis-1/3',
                  )}
                >
                  <Link
                    href={`/encyclopedia?island=${encodeURIComponent(island.name)}`}
                    className="group relative block aspect-[3/4] animate-in overflow-hidden bg-field fill-mode-both fade-in outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <IslandCardImage
                      images={islandImages.get(island.name) ?? []}
                      alt={island.name}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
                      <div>
                        <p className="text-xl leading-tight font-semibold">
                          {island.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/75 tabular-nums">
                          <BookOpenText
                            className="size-3.5"
                            strokeWidth={1.75}
                          />
                          {island.count}
                          <span className="sr-only">artikel</span>
                        </p>
                      </div>
                      <ArrowUpRight
                        className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.75}
                      />
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : null}
      </div>
    </section>
  );
}
