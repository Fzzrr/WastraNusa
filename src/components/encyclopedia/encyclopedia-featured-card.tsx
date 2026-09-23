import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { ArrowRight, Clock3, Eye } from 'lucide-react';
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
      <Card className="group overflow-hidden rounded-2xl border border-[#d5ccbc] bg-[#faf8f2] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c0b39a] hover:shadow-[0_18px_36px_-26px_rgba(47,91,73,0.55)]">
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
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-110"
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
              <Badge className="rounded bg-[#2f5f49] px-2 py-0.5 text-[#edf3e8] hover:bg-[#2f5f49]/90">
                Unggulan
              </Badge>
              <Badge
                variant="outline"
                className="rounded border-0 bg-[#ece6d9] px-2 py-0.5 text-[#b5a996] hover:bg-[#ece6d9]/90"
              >
                {article.region}
              </Badge>
              <Badge
                variant="outline"
                className="rounded border-0 bg-[#efe2d8] px-2 py-0.5 text-[#c17f61] hover:bg-[#efe2d8]/90"
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
    <Card className="group overflow-hidden rounded-2xl border border-[#d5ccbc] bg-[#faf8f2] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c0b39a] hover:shadow-[0_26px_52px_-30px_rgba(47,91,73,0.55)]">
      <div className="grid md:grid-cols-[320px_minmax(0,1fr)]">
        {/* Image Placeholder */}
        <div className="relative min-h-[185px] overflow-hidden border-b border-dashed border-[#dacfbf] bg-[#ece1d0] md:min-h-[220px] md:border-b-0 md:border-r">
          {article.imageURL ? (
            <Image
              src={article.imageURL}
              alt={article.title}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
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
        <div className="p-5">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <Badge className="rounded bg-[#2f5f49] px-2 py-1 text-[#edf3e8] hover:bg-[#2f5f49]/90">
              Unggulan
            </Badge>
            <Badge
              variant="outline"
              className="rounded border-0 bg-[#ece6d9] px-2 py-1 text-[#aea28f] hover:bg-[#ece6d9]/90"
            >
              {article.region}
            </Badge>
            <Badge
              variant="outline"
              className="rounded border-0 bg-[#efe2d8] px-2 py-1 text-[#c17f61] hover:bg-[#efe2d8]/90"
            >
              {article.topic}
            </Badge>
          </div>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#2f5b49]">
            {article.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4f6658]">
            {article.excerpt}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4f6658]">
            {article.readMinutes && (
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                  <Clock3 className="size-3.5" />
                </span>
                {article.readMinutes}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                <Eye className="size-3.5" />
              </span>
              {article.views}
            </span>
          </div>

          <Button
            variant="outline"
            className="group/btn mt-4 inline-flex items-center gap-1 rounded-xl border-[#98ab9e] px-4 py-2 text-sm font-bold text-[#2f5f49] transition hover:border-[#2f5f49] hover:bg-[#2f5f49] hover:text-[#edf3e8] active:scale-95"
            onClick={() => onReadMore?.(article)}
          >
            Baca Selengkapnya
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
