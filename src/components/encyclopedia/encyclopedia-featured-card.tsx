import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { ArrowRight, Clock3, Eye, MapPin, Star } from 'lucide-react';
import Image from 'next/image';

interface EncyclopediaFeaturedCardProps {
  article: EncyclopediaArticle;
  viewMode?: 'grid' | 'list';
  onReadMore?: (article: EncyclopediaArticle) => void;
}

export function EncyclopediaFeaturedCard({
  article,
  viewMode = 'grid',
  onReadMore,
}: EncyclopediaFeaturedCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden rounded-2xl border border-[#d5ccbc] bg-[#faf8f2]">
        <div className="flex items-start gap-4 p-4">
          {/* Image */}
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-dashed border-[#ded3c1] bg-[#ece1d0]">
            {article.imageURL ? (
              <Image
                src={article.imageURL}
                alt={article.title}
                fill
                unoptimized
                sizes="128px"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-[#726759]">
                  <span className="h-4 w-4 rotate-45 border border-[#ccbda4]" />
                  <span className="text-xs font-medium text-center">
                    {article.motifLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <Badge className="gap-1 rounded-full bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] px-2 py-0.5 text-[#3c2e14]">
                <Star className="size-3 fill-current" />
                Unggulan
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 rounded-full border-0 bg-[#e3ece5] px-2 py-0.5 text-[#2f5b49]"
              >
                <MapPin className="size-3" />
                {article.region}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-0 bg-[#f6e4da] px-2 py-0.5 text-[#b8613f]"
              >
                {article.topic}
              </Badge>
            </div>

            <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-[#2f5b49]">
              {article.title}
            </h2>

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#4f6658]">
              {article.excerpt}
            </p>

            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[#4f6658]">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                  <Clock3 className="size-3.5" />
                </span>
                {article.readMinutes}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                  <Eye className="size-3.5" />
                </span>
                {article.views}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="group relative animate-in cursor-pointer overflow-hidden rounded-2xl border-0 bg-[#fbf8f2] p-0 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_16px_36px_-20px_rgba(89,69,38,0.35)] ring-1 ring-[#e3d9c7] transition-all duration-500 fade-in slide-in-from-bottom-2 hover:-translate-y-1 hover:shadow-[0_28px_48px_-24px_rgba(47,91,73,0.45)] hover:ring-[#caa86a]/50"
      onClick={() => onReadMore?.(article)}
    >
      <span className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_100%_0%,rgba(232,203,141,0.22),transparent_70%)]" />
      <div className="grid md:grid-cols-[320px_minmax(0,1fr)]">
        {/* Image Placeholder */}
        <div className="relative min-h-[185px] overflow-hidden bg-[#ece1d0] md:min-h-[220px]">
          {article.imageURL ? (
            <Image
              src={article.imageURL}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-2 text-[#766a56]">
                <span className="h-5 w-5 rotate-45 border border-[#ccbda4]" />
                <span className="text-sm font-semibold">
                  {article.motifLabel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative p-5">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <Badge className="gap-1 rounded-full bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] px-2.5 py-1 text-[#3c2e14] shadow-[0_4px_12px_-4px_rgba(202,168,106,0.8)]">
              <Star className="size-3 fill-current" />
              Unggulan
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 rounded-full border-0 bg-[#e3ece5] px-2.5 py-1 text-[#2f5b49]"
            >
              <MapPin className="size-3" />
              {article.region}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-0 bg-[#f6e4da] px-2.5 py-1 text-[#b8613f]"
            >
              {article.topic}
            </Badge>
          </div>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#2f5b49] transition-colors group-hover:text-[#244a39]">
            {article.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4f6658]">
            {article.excerpt}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#4f6658]">
            {article.readMinutes && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1ede6] py-1 pr-2.5 pl-1">
                <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#2f5f49]">
                  <Clock3 className="size-3" />
                </span>
                {article.readMinutes} Menit Baca
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1ede6] py-1 pr-2.5 pl-1">
              <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#2f5f49]">
                <Eye className="size-3" />
              </span>
              {article.views} Kunjungan
            </span>
          </div>

          <Button
            className="group/cta mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2f5f49] to-[#3f7359] px-4 py-2 text-sm font-bold text-[#eef3ea] shadow-[0_10px_20px_-10px_rgba(47,95,73,0.8)] transition-all hover:-translate-y-0.5 hover:from-[#274e3c] hover:to-[#35644d]"
            onClick={(event) => {
              event.stopPropagation();
              onReadMore?.(article);
            }}
          >
            Baca Selengkapnya
            <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
