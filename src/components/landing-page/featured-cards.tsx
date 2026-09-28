'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles } from '@/hooks/use-article';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type FeaturedArticleCard = {
  slug: string;
  title: string;
  subtitle: string;
  topic: string;
  imageURL?: string | null;
};

const CARD_BACKGROUNDS = [
  'from-[#5d4336]/80 via-[#3f2d25]/45 to-[#1d1715]/88',
  'from-[#485a50]/80 via-[#31443d]/45 to-[#181d1b]/88',
];

export function FeaturedCards() {
  const { data, error, isPending } = useArticles(1, 6);

  const featuredArticles: FeaturedArticleCard[] =
    data?.items
      .filter((article) => article.imageURL)
      .slice(0, 2)
      .map((article) => ({
        slug: article.slug,
        title: article.title,
        subtitle: article.region || article.motifLabel,
        topic: article.topic,
        imageURL: article.imageURL,
      })) ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {isPending
        ? Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={`featured-skeleton-${index}`}
              className="overflow-hidden rounded-2xl border border-[#ddd5c6] bg-[#5a453a] shadow-sm"
            >
              <div className="relative min-h-[150px] p-4 sm:min-h-[180px] lg:min-h-[215px]">
                <Skeleton className="absolute inset-0 h-full w-full bg-white/10" />
                <div className="relative z-10 mt-auto flex min-h-[110px] flex-col justify-end sm:min-h-[140px] lg:min-h-[168px]">
                  <Skeleton className="mb-3 h-6 w-24 rounded-full bg-white/20" />
                  <Skeleton className="h-7 w-4/5 bg-white/20" />
                  <Skeleton className="mt-2 h-4 w-1/2 bg-white/20" />
                </div>
              </div>
            </Card>
          ))
        : null}

      {!isPending && error ? (
        <Card className="rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-5 text-sm text-[#8b5e4a] sm:col-span-2 lg:col-span-1">
          Gagal memuat kartu unggulan.
        </Card>
      ) : null}

      {!isPending && !error && featuredArticles.length > 0
        ? featuredArticles.map((article, index) => (
            <Link key={article.slug} href={`/encyclopedia/${article.slug}`}>
              <Card className="group relative overflow-hidden rounded-2xl border border-[#ddd5c6] bg-[#5a453a] shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#c7b59b] hover:shadow-[0_22px_42px_-24px_rgba(45,95,72,0.6)]">
                <div className="absolute inset-0">
                  {article.imageURL ? (
                    <Image
                      src={article.imageURL}
                      alt={article.title}
                      fill
                      className="object-cover transition duration-700 ease-out group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : null}
                </div>
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length]}`}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(249,229,193,.28)_0%,rgba(0,0,0,0)_36%)]" />
                <span className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#e8cb8d] to-transparent transition-transform duration-500 group-hover:scale-x-100" />

                <span className="absolute right-4 top-4 z-10 grid h-9 w-9 translate-y-1 place-items-center rounded-full border border-white/25 bg-black/30 text-[#f6eee1] opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>

                <div className="relative flex min-h-[150px] items-end p-4 sm:min-h-[180px] lg:min-h-[225px]">
                  <div className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                    <Badge className="mb-3 rounded-full border border-white/15 bg-white/14 px-2.5 py-1 text-[11px] font-semibold text-[#f6eee1] backdrop-blur-sm transition-colors group-hover:border-[#e8cb8d]/50 group-hover:bg-[#e8cb8d]/25 group-hover:text-[#fff6e3]">
                      {article.topic}
                    </Badge>
                    <p className="text-base font-semibold leading-tight text-[#f6eee1] drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] lg:text-lg">
                      <span className="bg-gradient-to-r from-[#e8cb8d] to-[#e8cb8d] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                        {article.title}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[#d5cab9]">
                      {article.subtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        : null}

      {!isPending && !error && featuredArticles.length === 0 ? (
        <Card className="rounded-2xl border border-[#ddd5c6] bg-[#f8f3ea] p-5 text-sm text-[#5f7366] sm:col-span-2 lg:col-span-1">
          Belum ada artikel bergambar untuk ditampilkan.
        </Card>
      ) : null}
    </div>
  );
}
