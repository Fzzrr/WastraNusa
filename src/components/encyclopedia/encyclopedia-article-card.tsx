'use client';

import type { EncyclopediaArticle } from '@/types/encyclopedia';
import { Eye, Heart, ImageOff, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface EncyclopediaArticleCardProps {
  article: EncyclopediaArticle;
  onClick?: (article: EncyclopediaArticle) => void;
}

export function EncyclopediaArticleCard({
  article,
  onClick,
}: EncyclopediaArticleCardProps) {
  const region = article.region.replace(/^(Kabupaten|Kota)\s+/i, '');
  // Images are hotlinked; a dead link falls back to the motif placeholder.
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      className="group flex h-full w-full cursor-pointer flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-ground"
      onClick={() => onClick?.(article)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {article.imageURL && !imageFailed ? (
          <Image
            src={article.imageURL}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageFailed(true)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <ImageOff
            className="absolute inset-0 m-auto size-6 text-ink-soft"
            strokeWidth={1.5}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <h3 className="line-clamp-2 text-xl leading-snug font-semibold text-ink decoration-1 underline-offset-4 group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-ink-soft">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{region}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-base leading-relaxed text-ink-soft">
          {article.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-4 pt-3 text-[13px] text-ink-soft tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-4" strokeWidth={1.75} />
            <span className="sr-only">Suka</span>
            {article.likes}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-4" strokeWidth={1.75} />
            <span className="sr-only">Dilihat</span>
            {article.views}
          </span>
        </div>
      </div>
    </button>
  );
}
