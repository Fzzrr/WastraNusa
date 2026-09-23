import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { Eye, Heart } from 'lucide-react';
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
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c0b39a] hover:shadow-[0_18px_36px_-26px_rgba(47,91,73,0.55)]"
      onClick={() => onClick?.(article)}
    >
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

          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-[#315746] transition-colors duration-300 group-hover:text-[#2f5f49]">
            {article.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#566d60]">
            {article.excerpt}
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[#4f6658]">
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
      </div>
    </Card>
  );
}
