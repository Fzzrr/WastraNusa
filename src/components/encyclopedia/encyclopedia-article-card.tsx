import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { Eye, Heart } from 'lucide-react';
import Image from 'next/image';

interface EncyclopediaArticleCardProps {
  article: EncyclopediaArticle;
  onClick?: (article: EncyclopediaArticle) => void;
}

export function EncyclopediaArticleCard({
  article,
  onClick,
}: EncyclopediaArticleCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#c0b39a] hover:shadow-[0_22px_42px_-26px_rgba(47,91,73,0.55)]"
      onClick={() => onClick?.(article)}
    >
      {/* Image Placeholder */}
      <div className="relative h-44 overflow-hidden border-b border-dashed border-[#ded3c1] bg-[#ece1d0]">
        {article.imageURL ? (
          <Image
            src={article.imageURL}
            alt={article.title}
            fill
            unoptimized
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-[#726759]">
              <span className="h-4 w-4 rotate-45 border border-[#ccbda4]" />
              <span className="text-sm font-medium">{article.motifLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
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

        <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-[#315746] transition-colors duration-300 group-hover:text-[#2f5f49]">
          {article.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#566d60]">
          {article.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-[#4f6658]">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
              <Heart className="size-3.5" />
            </span>
            {article.likes}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
              <Eye className="size-3.5" />
            </span>
            {article.views}
          </span>
        </div>
      </div>
    </Card>
  );
}
