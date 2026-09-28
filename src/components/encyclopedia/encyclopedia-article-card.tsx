import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { ArrowUpRight, Eye, Heart, MapPin } from 'lucide-react';
import Image from 'next/image';

interface EncyclopediaArticleCardProps {
  article: EncyclopediaArticle;
  onClick?: (article: EncyclopediaArticle) => void;
}

export function EncyclopediaArticleCard({
  article,
  onClick,
}: EncyclopediaArticleCardProps) {
  const region = article.region.replace(/^(Kabupaten|Kota)\s+/i, '');

  return (
    <Card
      className="group h-full cursor-pointer gap-0 overflow-hidden rounded-2xl border-0 bg-[#fbf8f2] p-0 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_-18px_rgba(89,69,38,0.35)] ring-1 ring-[#e3d9c7] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_40px_-22px_rgba(47,91,73,0.5)] hover:ring-[#caa86a]/50"
      onClick={() => onClick?.(article)}
    >
      {/* Image Placeholder */}
      <div className="relative h-44 overflow-hidden bg-[#ece1d0]">
        {article.imageURL ? (
          <Image
            src={article.imageURL}
            alt={article.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-[#726759]">
              <span className="h-4 w-4 rotate-45 border border-[#ccbda4]" />
              <span className="text-sm font-medium">{article.motifLabel}</span>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute top-3 right-3 grid size-8 translate-y-1 place-items-center rounded-full border border-white/30 bg-black/30 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] transition-transform duration-500 group-hover:scale-x-100" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
          <Badge
            variant="outline"
            className="gap-1 rounded-full border-0 bg-[#e3ece5] px-2 py-0.5 text-[#2f5b49]"
          >
            <MapPin className="size-3" />
            {region}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-0 bg-[#f6e4da] px-2 py-0.5 text-[#b8613f]"
          >
            {article.topic}
          </Badge>
        </div>

        <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-[#315746] transition-colors group-hover:text-[#244a39]">
          {article.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#566d60]">
          {article.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold">
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
    </Card>
  );
}
