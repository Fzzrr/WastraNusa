'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { LANDING_ARTICLE_LIMIT, useArticles } from '@/hooks/use-article';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type HeroSlide = {
  id: string | number;
  title: string;
  place: string;
  description: string;
  imageURL?: string | null;
  slug: string;
  isSkeleton?: boolean;
};

const HERO_AUTOPLAY_DELAY = 5000;

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const autoplayTimerRef = useRef<number | null>(null);

  const { data, isPending } = useArticles(1, LANDING_ARTICLE_LIMIT);

  const slides: HeroSlide[] =
    isPending || !data?.items || data.items.length === 0
      ? Array.from({ length: 4 }).map((_, index) => ({
          id: `skeleton-${index}`,
          title: '',
          place: '',
          description: '',
          imageURL: undefined,
          slug: '',
          isSkeleton: true,
        }))
      : data.items.slice(0, 4).map((article) => ({
          id: article.slug,
          title: article.title,
          place: article.region,
          description: article.excerpt || article.title,
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
    <Card className="relative min-h-[380px] overflow-hidden rounded-none border-0 bg-field p-0 text-on-field ring-0 sm:min-h-[440px] lg:min-h-[540px]">
      {/* Slide titles rotate, so the page's single h1 names the site itself. */}
      <h1 className="sr-only">
        WastraNusa: belanja dan ensiklopedia wastra Nusantara
      </h1>
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
              <div className="relative flex h-full min-h-[380px] flex-col justify-end px-5 pt-6 pb-14 sm:min-h-[440px] sm:px-20 md:pb-16 lg:min-h-[540px]">
                {slide.imageURL ? (
                  <Image
                    src={slide.imageURL}
                    alt={slide.title}
                    fill
                    className={`object-cover transition-transform duration-[6000ms] ease-out ${
                      activeSlide === slideIndex ? 'scale-105' : 'scale-100'
                    }`}
                    // Next 16: `priority` is deprecated in favour of `preload`.
                    preload={slideIndex === 0}
                    loading="eager"
                    sizes="100vw"
                  />
                ) : null}
                {/* One neutral scrim, only where the text sits. */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                  aria-hidden="true"
                />

                <div className="relative z-10 max-w-2xl">
                  {slide.isSkeleton ? (
                    <div className="space-y-3">
                      <Skeleton className="h-11 w-72 rounded-none bg-white/15 md:h-14 md:w-96" />
                      <Skeleton className="h-5 w-40 rounded-none bg-white/15" />
                      <Skeleton className="h-5 w-full max-w-md rounded-none bg-white/15" />
                    </div>
                  ) : (
                    <>
                      <h2 className="line-clamp-2 pb-[0.1em] text-[clamp(2.25rem,5.2vw,4.75rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-white">
                        {slide.title}
                      </h2>
                      {slide.place ? (
                        <p className="mt-3 flex items-center gap-1.5 text-[15px] text-white/80">
                          <MapPin className="size-4" strokeWidth={1.75} />
                          {slide.place}
                        </p>
                      ) : null}
                      <p className="mt-4 line-clamp-2 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                        {slide.description}
                      </p>
                      <Button
                        asChild
                        className="group/cta mt-6 h-12 rounded-full bg-ground px-6 text-[15px] font-semibold text-ink transition hover:bg-white active:scale-95"
                      >
                        <Link href={`/encyclopedia/${slide.slug}`}>
                          Baca artikel
                          <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Button
        className="absolute left-5 top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/60 active:scale-95 sm:grid"
        type="button"
        aria-label="Slide sebelumnya"
        onClick={goToPreviousSlide}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Button
        className="absolute right-5 top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/60 active:scale-95 sm:grid"
        type="button"
        aria-label="Slide berikutnya"
        onClick={goToNextSlide}
      >
        <ChevronRight className="size-5" />
      </Button>

      <div className="pointer-events-none absolute bottom-4 left-[14px] z-20 flex items-center gap-0.5 sm:bottom-6 sm:left-[74px]">
        {slides.map((slide, index) => {
          const isActive = activeSlide === index;

          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ke slide ${index + 1}`}
              aria-current={isActive}
              // The bar is 6px tall; the button pads it to a tappable 24px.
              className="group pointer-events-auto grid h-6 place-items-center px-1.5"
              onClick={() => goToSlide(index)}
            >
              <span
                className={`relative block h-[3px] overflow-hidden transition-all duration-300 ${
                  isActive
                    ? 'w-10 bg-white/30'
                    : 'w-5 bg-white/35 group-hover:bg-white/70'
                }`}
              >
                {isActive ? (
                  // Fills over the autoplay delay; remounts per slide to restart.
                  <span
                    key={activeSlide}
                    className="absolute inset-0 animate-in bg-white ease-linear fill-mode-both slide-in-from-left-[100%]"
                    style={{ animationDuration: `${HERO_AUTOPLAY_DELAY}ms` }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
