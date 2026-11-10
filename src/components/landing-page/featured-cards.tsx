'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { LANDING_ARTICLE_LIMIT, useArticles } from '@/hooks/use-article';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type FeaturedArticleCard = {
  slug: string;
  title: string;
  place: string;
  imageURL?: string | null;
};

export function FeaturedCards() {
  const { data, error, isPending } = useArticles(1, LANDING_ARTICLE_LIMIT);

  const items = data?.items.slice(0, 6) ?? [];
  const withImage = items.filter((article) => article.imageURL);
  // The hero carousel shows the first four articles; pick others when there
  // are enough so the two cards beside it never repeat a slide.
  const notInHero = items.slice(4).filter((article) => article.imageURL);
  const featuredArticles: FeaturedArticleCard[] = (
    notInHero.length >= 2 ? notInHero : withImage
  )
    .slice(0, 2)
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      place: article.region || article.motifLabel,
      imageURL: article.imageURL,
    }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {isPending
        ? Array.from({ length: 2 }).map((_, index) => (
            <Skeleton
              key={`featured-skeleton-${index}`}
              className="min-h-[180px] rounded-none bg-surface lg:min-h-[262px]"
            />
          ))
        : null}

      {!isPending && error ? (
        <p className="bg-surface p-5 text-[15px] text-ink-soft sm:col-span-2 lg:col-span-1">
          Gagal memuat artikel.
        </p>
      ) : null}

      {!isPending && !error && featuredArticles.length > 0
        ? featuredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/encyclopedia/${article.slug}`}
              className="group relative block min-h-[180px] overflow-hidden bg-field outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:min-h-[262px]"
            >
              {article.imageURL ? (
                <Image
                  src={article.imageURL}
                  alt={article.title}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  // Above the fold beside the hero.
                  loading="eager"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-lg leading-snug font-semibold text-white">
                    {article.title}
                  </h3>
                  {article.place ? (
                    <p className="mt-1 flex items-center gap-1 text-[13px] text-white/75">
                      <MapPin
                        className="size-3.5 shrink-0"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{article.place}</span>
                    </p>
                  ) : null}
                </div>
                <ArrowUpRight
                  className="size-5 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          ))
        : null}

      {!isPending && !error && featuredArticles.length === 0 ? (
        <p className="bg-surface p-5 text-[15px] text-ink-soft sm:col-span-2 lg:col-span-1">
          Belum ada artikel bergambar.
        </p>
      ) : null}
    </div>
  );
}
