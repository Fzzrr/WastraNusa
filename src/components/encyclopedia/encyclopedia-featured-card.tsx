import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { ArrowRight, Clock3, Eye, ImageOff, MapPin } from 'lucide-react';
import Image from 'next/image';

interface EncyclopediaFeaturedCardProps {
  article: EncyclopediaArticle;
  onReadMore?: (article: EncyclopediaArticle) => void;
}

/** The lead article: a large picture beside its title, set like a spread. */
export function EncyclopediaFeaturedCard({
  article,
  onReadMore,
}: EncyclopediaFeaturedCardProps) {
  return (
    <button
      type="button"
      className="group grid w-full animate-in cursor-pointer text-left outline-none duration-500 fade-in slide-in-from-bottom-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-ground md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8"
      onClick={() => onReadMore?.(article)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {article.imageURL ? (
          <Image
            src={article.imageURL}
            alt={article.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <ImageOff
            className="absolute inset-0 m-auto size-8 text-ink-soft"
            strokeWidth={1.5}
          />
        )}
      </div>

      <div className="flex flex-col pt-5 md:py-2">
        <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.025em] text-ink">
          {article.title}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-[15px] text-ink-soft">
          <MapPin className="size-4 shrink-0" strokeWidth={1.75} />
          {article.region}
        </p>
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-ink">
          {article.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 text-[15px] text-ink-soft tabular-nums">
          {article.readMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" strokeWidth={1.75} />
              {article.readMinutes} mnt
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-4" strokeWidth={1.75} />
            <span className="sr-only">Dilihat</span>
            {article.views}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-brand">
            Baca
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}
