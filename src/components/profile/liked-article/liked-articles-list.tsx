import { Badge } from '@/components/ui/badge';
import type { LikedArticle } from '@/types/profile';
import { BookmarkX, ChevronRight, Eye, Heart, Hexagon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LikedArticlesListProps {
  articles: LikedArticle[];
}

export function LikedArticlesList({ articles }: LikedArticlesListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfbf] bg-[#fbf8f2]/50 text-[#726759]">
        <BookmarkX className="mb-3 h-10 w-10 text-[#ccbda4]" />
        <p className="text-sm font-medium">
          Kamu belum menyukai artikel apapun.
        </p>
        <p className="mt-1 text-xs text-[#a29582]">
          Jelajahi ensiklopedia dan temukan wastra favoritmu!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/encyclopedia/${article.slug}`}
          className="group flex items-center gap-4 rounded-xl border border-[#ece7dd] bg-white p-3.5 transition-all hover:border-[#dcd5c7] hover:bg-[#fcfbf9]"
        >
          <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#efe8db] text-[#b0a591] border border-[#e8e2d5]">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
              />
            ) : (
              <>
                <Hexagon
                  size={24}
                  strokeWidth={1.5}
                  className="text-[#c4b9a3]"
                />
                <span className="mt-1 absolute bottom-1 text-[8px] font-semibold tracking-wide text-[#a39882] uppercase">
                  {article.motifLabel.substring(0, 5)}
                </span>
              </>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="secondary"
                className="rounded border-none bg-[#fdf6f2] px-2 py-0.5 text-[10px] font-medium text-[#c4826b] hover:bg-[#fdf6f2]"
              >
                {article.topic}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded border-none bg-[#eef3ef] px-2 py-0.5 text-[10px] font-medium text-[#607565] hover:bg-[#eef3ef]"
              >
                {article.region}
              </Badge>
            </div>

            <h3 className="w-full truncate text-[15px] font-bold leading-none text-[#4d6356]">
              {article.title}
            </h3>

            <p className="line-clamp-2 text-[12px] leading-relaxed text-[#8f9b94]">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-[#8f9b94]">
              {article.readMinutes ? (
                <span>{article.readMinutes} mnt</span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {article.likes}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.views}
              </span>
            </div>
          </div>

          <div className="pl-2 pr-1">
            <ChevronRight
              size={18}
              className="text-[#a3b1a8] transition-transform group-hover:translate-x-1"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
