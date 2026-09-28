import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { Eye, Heart, MapPin } from 'lucide-react';
import Image from 'next/image';

interface EncyclopediaArticleListCardProps {
  article: EncyclopediaArticle;
  onClick?: (article: EncyclopediaArticle) => void;
}

export function EncyclopediaArticleListCard({
  article,
  onClick,
}: EncyclopediaArticleListCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden rounded-2xl border-0 bg-[#fbf8f2] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_-18px_rgba(89,69,38,0.35)] ring-1 ring-[#e3d9c7] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-22px_rgba(47,91,73,0.5)] hover:ring-[#caa86a]/50"
      onClick={() => onClick?.(article)}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Image */}
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-[#ece1d0] ring-1 ring-[#e3d9c7]">
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

          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-[#315746] transition-colors duration-300 group-hover:text-[#2f5f49]">
            {article.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#566d60]">
            {article.excerpt}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6e4da] py-1 pr-2.5 pl-1 text-[#b8613f]">
              <span className="flex size-5 items-center justify-center rounded-full bg-white">
                <Heart className="size-3" />
              </span>
              {article.likes}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3ece5] py-1 pr-2.5 pl-1 text-[#2f5b49]">
              <span className="flex size-5 items-center justify-center rounded-full bg-white">
                <Eye className="size-3" />
              </span>
              {article.views}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
