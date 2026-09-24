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
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function getIslandCardBackground(index: number) {
  const hue = 28 + ((index * 23) % 36);
  const start = `hsl(${hue} 38% 70%)`;
  const mid = `hsl(${hue - 6} 20% 47%)`;
  const end = `hsl(${hue - 12} 10% 27%)`;

  return `radial-gradient(circle at 80% 15%, rgba(255, 235, 190, 0.35) 0%, rgba(0, 0, 0, 0) 42%), linear-gradient(165deg, ${start} 0%, ${mid} 52%, ${end} 100%)`;
}

export function IslandCards() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { data, error, isPending } = useArticles(1, 50);
  const islands =
    data?.meta.islands.filter((island) => island.name !== 'Semua Pulau') ?? [];
  const shouldLoop = islands.length > 5;

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
    const imagesByIsland = new Map<string, string>();
    const articles: EncyclopediaArticle[] = data?.items ?? [];

    for (const article of articles) {
      const island = article.island ?? undefined;
      const imageURL = article.imageURL ?? undefined;

      if (!island || !imageURL || imagesByIsland.has(island)) continue;
      const isNextImageSupported =
        imageURL.startsWith('/') || imageURL.startsWith('https://');

      if (isNextImageSupported) {
        imagesByIsland.set(island, imageURL);
      }
    }

    return imagesByIsland;
  }, [data?.items]);

  const islandMapImages: Record<string, string> = {
    Jawa: '/islands_images/jawa.png',
    Bali: '/islands_images/bali.png',
    Sumatera: '/islands_images/sumatera.png',
    'Nusa Tenggara': '/islands_images/nusatenggara.png',
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
      <Badge
        variant="outline"
        className="inline-flex rounded-lg border-[#e4dac8] bg-[#f3ecdd] px-3 py-1 text-xs font-semibold text-[#b09c80]"
      >
        Jelajahi Pulau
      </Badge>

      <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#2d5f48] sm:text-2xl lg:text-2xl">
        Wastra dari Seluruh Nusantara
      </h3>

      <div className="mt-6">
        {isPending ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card
                key={index}
                className="min-w-[240px] overflow-hidden rounded-2xl border border-[#ddd4c6] bg-[#d8cfbf]/30"
              >
                <div className="min-h-[188px] animate-pulse p-4" />
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
            className="w-full px-12"
          >
            <Button
              type="button"
              className="absolute left-0 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#ddd4c6] bg-white text-[#2d5f48] shadow-sm transition hover:bg-[#2d5f48] hover:text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-[#2d5f48]"
              disabled={!canScrollPrev}
              onClick={() => carouselApi?.scrollPrev()}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              className="absolute right-0 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#ddd4c6] bg-white text-[#2d5f48] shadow-sm transition hover:bg-[#2d5f48] hover:text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-[#2d5f48]"
              disabled={!canScrollNext}
              onClick={() => carouselApi?.scrollNext()}
            >
              <ChevronRight />
            </Button>
            <CarouselContent className="-ml-4 py-0">
              {islands.map((island, index) => (
                <CarouselItem
                  key={island.name}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/5"
                >
                  <Link
                    href={`/encyclopedia?island=${encodeURIComponent(island.name)}`}
                  >
                    <Card className="group relative overflow-hidden rounded-2xl border border-[#ddd4c6] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#c7b59b] hover:shadow-[0_22px_42px_-24px_rgba(20,28,22,0.65)]">
                      {islandMapImages[island.name] ||
                      islandImages.get(island.name) ? (
                        <Image
                          src={
                            islandMapImages[island.name] ||
                            islandImages.get(island.name)!
                          }
                          alt={island.name}
                          fill
                          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 transition duration-700 ease-out group-hover:scale-110"
                          style={{
                            backgroundImage: getIslandCardBackground(index),
                          }}
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.78)_45%,rgba(0,0,0,0.35)_75%,rgba(0,0,0,0)_100%)]" />

                      <span className="absolute right-3 top-3 z-10 grid h-8 w-8 translate-y-1 place-items-center rounded-full border border-white/25 bg-black/30 text-[#f6f2e8] opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>

                      <div className="relative flex min-h-[188px] flex-col justify-end p-4 text-[#f6f2e8] transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                        <p className="mt-2 text-lg font-bold leading-tight">
                          {island.name}
                        </p>
                        <p className="text-xs text-[#d3ccb8]">
                          {island.count} artikel
                        </p>
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
