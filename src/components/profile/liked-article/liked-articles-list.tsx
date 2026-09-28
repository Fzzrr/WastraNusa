import {
  ProfileEmptyState,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LikedArticle } from '@/types/profile';
import {
  BookOpenText,
  BookmarkX,
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  Hexagon,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LikedArticlesListProps {
  articles: LikedArticle[];
}

export function LikedArticlesList({ articles }: LikedArticlesListProps) {
  if (articles.length === 0) {
    return (
      <ProfileEmptyState
        icon={BookmarkX}
        title="Belum ada artikel yang disukai"
        description="Jelajahi ensiklopedia dan temukan wastra favorit Anda!"
        action={
          <Button
            asChild
            className={cn(profilePrimaryButtonClassName, 'h-9 px-4')}
          >
            <Link href="/encyclopedia">
              <BookOpenText className="size-4" />
              Jelajahi Ensiklopedia
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/encyclopedia/${article.slug}`}
          className="group flex items-center gap-4 rounded-2xl bg-white p-3.5 ring-1 ring-[#efe8dd] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-22px_rgba(89,69,38,0.45)] hover:ring-[#caa86a]/50"
        >
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#efe8db] text-[#b0a591] ring-1 ring-[#e8e2d5]">
            {article.imageUrl ? (
              <>
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-white/90 text-[#b8613f] shadow-sm">
                  <Heart className="size-3 fill-current" />
                </span>
              </>
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
                className="rounded-full border-none bg-[#f6e4da] px-2 py-0.5 text-[10px] font-medium text-[#b8613f] hover:bg-[#f6e4da]"
              >
                {article.topic}
              </Badge>
              <Badge
                variant="secondary"
                className="gap-1 rounded-full border-none bg-[#e3ece5] px-2 py-0.5 text-[10px] font-medium text-[#2f5b49] hover:bg-[#e3ece5]"
              >
                <MapPin className="size-2.5" />
                {article.region}
              </Badge>
            </div>

            <h3 className="w-full truncate text-[15px] leading-tight font-bold text-[#2f4f3f] transition-colors group-hover:text-[#244a39]">
              {article.title}
            </h3>

            <p className="line-clamp-2 text-[12px] leading-relaxed text-[#9a8f80]">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold text-[#4f6658]">
              {article.readMinutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                    <Clock3 className="size-3" />
                  </span>
                  {article.readMinutes}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                  <Heart className="size-3" />
                </span>
                {article.likes}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                  <Eye className="size-3" />
                </span>
                {article.views}
              </span>
            </div>
          </div>

          <div className="pl-2 pr-1">
            <ChevronRight
              size={18}
              className="text-[#caa86a] transition-transform group-hover:translate-x-1"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
