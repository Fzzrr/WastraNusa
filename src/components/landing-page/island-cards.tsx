'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useArticles } from '@/hooks/use-article';
import { cn } from '@/lib/utils';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import {
  ArrowUpRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const navButtonClassName =
  'absolute top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#ddd4c6] bg-white text-[#2d5f48] shadow-sm transition hover:scale-105 hover:bg-[#2d5f48] hover:text-white active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-[#2d5f48]';

function getIslandCardBackground(index: number) {
  const hue = 28 + ((index * 23) % 36);
  const start = `hsl(${hue} 38% 70%)`;
  const mid = `hsl(${hue - 6} 20% 47%)`;
  const end = `hsl(${hue - 12} 10% 27%)`;

  return `radial-gradient(circle at 80% 15%, rgba(255, 235, 190, 0.35) 0%, rgba(0, 0, 0, 0) 42%), linear-gradient(165deg, ${start} 0%, ${mid} 52%, ${end} 100%)`;
}

function IslandCardImage({
  images,
  alt,
  index,
}: {
  images: string[];
  alt: string;
  index: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div
        className="absolute inset-0 transition duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: getIslandCardBackground(index) }}
      />
    );
  }

  return (
    <>
      {images.map((src, imageIndex) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-700 ease-out group-hover:scale-110 ${
            imageIndex === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </>
  );
}

export function IslandCards() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { data, error, isPending } = useArticles(1, 50);
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
    <section className="mx-auto mt-16 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="inline-flex gap-1.5 rounded-lg border-[#e6d6b8] bg-[#f5ead3] px-3 py-1 text-xs font-semibold text-[#8a6a2a]"
          >
            <Compass className="size-3 text-[#caa86a]" />
            Jelajahi Pulau
          </Badge>

          <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#2d5f48]">
            Wastra dari Seluruh{' '}
            <span className="bg-gradient-to-r from-[#2d5f48] via-[#7a8f4e] to-[#caa86a] bg-clip-text text-transparent">
              Nusantara
            </span>
          </h3>
          <p className="mt-1 text-sm text-[#5f7366]">
            Temukan ragam kain tradisional dari setiap pulau di Indonesia.
          </p>
        </div>

        <Link
          href="/encyclopedia"
          className="group/all inline-flex items-center gap-1.5 rounded-xl border border-[#2f4f3f] px-4 py-2 text-sm font-semibold text-[#2f4f3f] transition hover:-translate-y-0.5 hover:bg-[#2d5f48] hover:text-white hover:shadow-[0_10px_20px_-12px_rgba(45,95,72,0.8)]"
        >
          Lihat Semua
          {!isPending && islands.length > 0 ? (
            <span className="rounded-full bg-[#e3ece5] px-1.5 text-xs text-[#2f5f49] transition-colors group-hover/all:bg-white/20 group-hover/all:text-white">
              {islands.length} Pulau
            </span>
          ) : null}
          <ChevronRight className="size-4 transition-transform group-hover/all:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-6">
        {isPending ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card
                key={index}
                className="min-w-[240px] overflow-hidden rounded-2xl border border-[#ddd4c6] bg-[#d8cfbf]/30"
              >
                <div className="min-h-[240px] animate-pulse p-4" />
              </Card>
            ))}
          </div>
        ) : null}

        {!isPending && error ? (
          <div className="rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-6 text-sm text-[#8b5e4a]">
            Gagal memuat pulau ensiklopedia.
          </div>
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
            className={cn('w-full', hasOverflow && 'px-12')}
          >
            {hasOverflow ? (
              <>
                <Button
                  type="button"
                  aria-label="Pulau sebelumnya"
                  className={navButtonClassName + ' left-0'}
                  disabled={!canScrollPrev}
                  onClick={() => carouselApi?.scrollPrev()}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  aria-label="Pulau berikutnya"
                  className={navButtonClassName + ' right-0'}
                  disabled={!canScrollNext}
                  onClick={() => carouselApi?.scrollNext()}
                >
                  <ChevronRight />
                </Button>
              </>
            ) : null}
            {/* Vertical padding keeps the hover lift and shadow from being clipped. */}
            <CarouselContent className="-ml-4 py-3">
              {islands.map((island, index) => (
                <CarouselItem
                  key={island.name}
                  className={cn(
                    'basis-full pl-4 sm:basis-1/2',
                    islands.length >= 5
                      ? 'lg:basis-1/3 xl:basis-1/5'
                      : islands.length === 4
                        ? 'lg:basis-1/4'
                        : 'lg:basis-1/3',
                  )}
                >
                  <Link
                    href={`/encyclopedia?island=${encodeURIComponent(island.name)}`}
                    className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#caa86a]"
                  >
                    <Card
                      className="group relative animate-in overflow-hidden rounded-2xl border-0 p-0 ring-1 ring-black/5 transition-all duration-500 ease-out fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-1.5 hover:shadow-[0_26px_44px_-24px_rgba(20,28,22,0.7)] hover:ring-2 hover:ring-[#e8cb8d]/70"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <IslandCardImage
                        images={islandImages.get(island.name) ?? []}
                        alt={island.name}
                        index={index}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(12,20,15,0.95)_0%,rgba(12,20,15,0.7)_38%,rgba(12,20,15,0.15)_70%,rgba(0,0,0,0)_100%)]" />

                      <span className="absolute top-3 left-3 z-10 rounded-full bg-black/30 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#f3dfb4] ring-1 ring-white/20 backdrop-blur">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="absolute top-3 right-3 z-10 grid size-8 translate-y-1 place-items-center rounded-full border border-white/25 bg-black/30 text-[#f6f2e8] opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight className="size-4" />
                      </span>

                      <div className="relative flex min-h-[240px] flex-col justify-end p-4 text-[#f6f2e8]">
                        <span className="mb-2 h-0.5 w-8 rounded-full bg-gradient-to-r from-[#e8cb8d] to-[#caa86a] transition-all duration-500 group-hover:w-14" />
                        <p className="text-xl leading-tight font-bold transition-colors group-hover:text-[#f3dfb4]">
                          {island.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-[#e4ddcc] ring-1 ring-white/15 backdrop-blur">
                            <BookOpenText className="size-3 text-[#e8cb8d]" />
                            <span className="font-semibold text-white">
                              {island.count}
                            </span>{' '}
                            Artikel
                          </span>
                          <span className="inline-flex -translate-x-1 items-center gap-1 text-xs font-semibold text-[#f3dfb4] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            Jelajahi
                            <ChevronRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    </Card>
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
