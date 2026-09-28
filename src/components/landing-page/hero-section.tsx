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
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles } from '@/hooks/use-article';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type HeroSlide = {
  id: string | number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundClassName: string;
  imageURL?: string | null;
  slug: string;
  isSkeleton?: boolean;
};

const HERO_BACKGROUNDS = [
  'bg-[radial-gradient(circle_at_65%_60%,rgba(190,140,56,0.66),rgba(31,26,20,0.05)_38%,transparent_70%),linear-gradient(132deg,#02040d_0%,#0e1019_42%,#51371d_100%)]',
  'bg-[radial-gradient(circle_at_30%_26%,rgba(242,179,91,0.6),transparent_38%),linear-gradient(130deg,#121620_0%,#223d4e_42%,#926328_100%)]',
  'bg-[radial-gradient(circle_at_80%_20%,rgba(224,152,69,0.42),transparent_40%),linear-gradient(120deg,#10141d_0%,#3c2a24_52%,#744924_100%)]',
  'bg-[radial-gradient(circle_at_50%_22%,rgba(207,168,108,0.46),transparent_46%),linear-gradient(132deg,#0a1018_0%,#253040_40%,#5b3c1f_100%)]',
];
const HERO_AUTOPLAY_DELAY = 5000;

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const autoplayTimerRef = useRef<number | null>(null);

  const { data, isPending } = useArticles(1, 4);

  const slides: HeroSlide[] =
    isPending || !data?.items || data.items.length === 0
      ? Array.from({ length: 4 }).map((_, index) => ({
          id: `skeleton-${index}`,
          badge: 'Memuat...',
          title: 'Memuat Artikel...',
          subtitle: 'Harap tunggu sebentar',
          description: 'Sedang mengambil data artikel terbaru...',
          backgroundClassName:
            HERO_BACKGROUNDS[index % HERO_BACKGROUNDS.length],
          imageURL: undefined,
          slug: '',
          isSkeleton: true,
        }))
      : data.items.slice(0, 4).map((article, index) => ({
          id: article.slug,
          badge: article.topic,
          title: article.title,
          subtitle: article.motifLabel || article.region,
          description: article.excerpt || article.title,
          backgroundClassName:
            HERO_BACKGROUNDS[index % HERO_BACKGROUNDS.length],
          imageURL: article.imageURL,
          slug: article.slug,
        }));

  const resetAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      window.clearTimeout(autoplayTimerRef.current);
    }

    if (!carouselApi || slides.length <= 1) return;

    autoplayTimerRef.current = window.setTimeout(() => {
      carouselApi.scrollNext();
    }, HERO_AUTOPLAY_DELAY);
  }, [carouselApi, slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      carouselApi?.scrollTo(index);
      resetAutoplay();
    },
    [carouselApi, resetAutoplay],
  );

  const goToPreviousSlide = useCallback(() => {
    carouselApi?.scrollPrev();
    resetAutoplay();
  }, [carouselApi, resetAutoplay]);

  const goToNextSlide = useCallback(() => {
    carouselApi?.scrollNext();
    resetAutoplay();
  }, [carouselApi, resetAutoplay]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
      resetAutoplay();
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);
    carouselApi.on('pointerDown', resetAutoplay);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
      carouselApi.off('pointerDown', resetAutoplay);
    };
  }, [carouselApi, resetAutoplay]);

  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) {
        window.clearTimeout(autoplayTimerRef.current);
      }
    };
  }, []);

  return (
    <Card className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[#ddd5c6] bg-[#17130f] p-0 text-[#f7f3ea] shadow-[0_20px_44px_-30px_rgba(22,19,15,0.85)] ring-0 sm:min-h-[360px] md:min-h-[420px]">
      <Carousel
        setApi={setCarouselApi}
        opts={{
          loop: true,
        }}
        className="h-full"
      >
        <CarouselContent className="-ml-0 h-full">
          {slides.map((slide, slideIndex) => (
            <CarouselItem key={slide.id} className="pl-0 h-full">
              <div className="relative flex h-full min-h-[300px] flex-col justify-end pb-8 pt-5 pr-5 pl-14 sm:min-h-[360px] sm:pb-12 sm:pt-6 sm:pr-6 sm:pl-20 md:min-h-[420px] md:pb-14 md:pt-8 md:pr-8 md:pl-20">
                <div
                  className={`absolute inset-0 ${slide.backgroundClassName}`}
                  aria-hidden="true"
                />
                {slide.imageURL ? (
                  <Image
                    src={slide.imageURL}
                    alt={slide.title}
                    fill
                    className={`object-cover opacity-60 transition-transform duration-[6000ms] ease-out ${
                      activeSlide === slideIndex ? 'scale-110' : 'scale-100'
                    }`}
                    priority={!slide.isSkeleton}
                    sizes="100vw"
                  />
                ) : null}
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(250,227,195,0.24)_0%,rgba(0,0,0,0)_38%)]"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/42 to-black/30"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  {slide.isSkeleton ? (
                    <Skeleton className="mb-3 h-[26px] w-32 rounded-lg bg-white/20" />
                  ) : (
                    <Badge
                      variant="outline"
                      className="mb-3 w-fit gap-1.5 rounded-full border-[#e8cb8d]/40 bg-black/35 px-3 py-1 text-xs font-semibold text-[#f3dfb4] shadow-[0_0_20px_-6px_rgba(232,203,141,0.6)] backdrop-blur"
                    >
                      <Sparkles className="size-3 text-[#e8cb8d]" />
                      {slide.badge}
                    </Badge>
                  )}

                  {slide.isSkeleton ? (
                    <div className="mb-4 mt-1 space-y-2">
                      <Skeleton className="h-10 w-64 bg-white/20 md:h-12 md:w-80" />
                      <Skeleton className="h-10 w-48 bg-white/20 md:h-12 md:w-64" />
                    </div>
                  ) : (
                    <h1 className="max-w-xl text-2xl font-bold leading-[1.15] tracking-tight text-[#f7f2e7] drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:text-3xl md:text-4xl lg:text-[46px]">
                      <span className="block line-clamp-2">{slide.title}</span>
                      <span className="mt-1 block line-clamp-1 bg-gradient-to-r from-[#f3dfb4] via-[#e8cb8d] to-[#caa86a] bg-clip-text text-[0.72em] text-transparent md:text-[0.68em]">
                        {slide.subtitle}
                      </span>
                    </h1>
                  )}

                  {slide.isSkeleton ? (
                    <div className="mt-4 max-w-xl space-y-2">
                      <Skeleton className="h-5 w-full bg-white/20" />
                      <Skeleton className="h-5 w-5/6 bg-white/20" />
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-[#d5cec0] line-clamp-2 sm:mt-4 sm:min-h-[3.5rem] sm:text-base">
                      {slide.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
                    {slide.isSkeleton ? (
                      <>
                        <Skeleton className="h-[42px] w-32 rounded-xl bg-white/20" />
                        <Skeleton className="h-[42px] w-48 rounded-xl bg-white/20" />
                      </>
                    ) : (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          className="group/cta rounded-xl border-transparent bg-gradient-to-r from-[#f3dfb4] to-[#d7ccb7] px-5 py-2.5 text-sm font-bold text-[#2c503f] shadow-[0_10px_24px_-12px_rgba(232,203,141,0.9)] transition hover:-translate-y-0.5 hover:border-[#2d5f48] hover:from-[#2d5f48] hover:to-[#3f7359] hover:text-white hover:shadow-lg active:scale-95"
                        >
                          <Link href={`/encyclopedia/${slide.slug}`}>
                            Baca Artikel
                            <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-[#f8f3e9] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#e8cb8d]/60 hover:bg-white/20 active:scale-95"
                        >
                          <Link href="/encyclopedia">
                            Jelajahi Ensiklopedia
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Badge
        className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs font-semibold text-[#e8e2d5] tabular-nums backdrop-blur-md"
        variant="secondary"
      >
        <span className="text-[#f3dfb4]">{activeSlide + 1}</span> /{' '}
        {slides.length}
      </Badge>
      <Button
        className="absolute left-5 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/12 text-[#efe9db] backdrop-blur transition hover:scale-110 hover:border-[#e8cb8d]/50 hover:bg-white/25 active:scale-95"
        type="button"
        aria-label="Slide sebelumnya"
        onClick={goToPreviousSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        className="absolute right-5 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/12 text-[#efe9db] backdrop-blur transition hover:scale-110 hover:border-[#e8cb8d]/50 hover:bg-white/25 active:scale-95"
        type="button"
        aria-label="Slide berikutnya"
        onClick={goToNextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {slides.map((slide, index) => {
          const isActive = activeSlide === index;

          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={isActive}
              className={`pointer-events-auto relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-8 bg-white/30 shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              onClick={() => goToSlide(index)}
            >
              {isActive ? (
                // Fills over the autoplay delay; remounts per slide to restart.
                <span
                  key={activeSlide}
                  className="absolute inset-0 animate-in rounded-full bg-gradient-to-r from-[#f3dfb4] to-white ease-linear fill-mode-both slide-in-from-left-[100%]"
                  style={{ animationDuration: `${HERO_AUTOPLAY_DELAY}ms` }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
