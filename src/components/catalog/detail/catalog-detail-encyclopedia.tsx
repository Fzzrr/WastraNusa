import type { EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { ArrowRight, BookOpenText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type CatalogDetailEncyclopediaProps = {
  category: string;
  linkedArticle?: EncyclopediaArticleDetail;
  isLinkedArticlePending?: boolean;
};

export function CatalogDetailEncyclopedia({
  category,
  linkedArticle,
  isLinkedArticlePending = false,
}: CatalogDetailEncyclopediaProps) {
  if (isLinkedArticlePending) {
    return (
      <aside className="space-y-3" aria-busy="true">
        <div className="aspect-[3/2] animate-pulse bg-surface" />
        <div className="h-6 w-2/3 animate-pulse bg-surface" />
        <div className="h-4 w-full animate-pulse bg-surface" />
      </aside>
    );
  }

  if (!linkedArticle) {
    return (
      <aside className="bg-surface p-5">
        <p className="text-base text-ink-soft">
          Belum ada artikel tentang {category}.
        </p>
        <Link
          href="/encyclopedia"
          className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand underline-offset-4 hover:underline"
        >
          Ensiklopedia
          <ArrowRight className="size-4" />
        </Link>
      </aside>
    );
  }

  return (
    <aside>
      <Link
        href={`/encyclopedia/${linkedArticle.slug}`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-ground"
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-surface">
          {linkedArticle.imageURL ? (
            <Image
              src={linkedArticle.imageURL}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1279px) 100vw, 320px"
            />
          ) : (
            <BookOpenText
              className="absolute inset-0 m-auto size-8 text-ink-soft"
              strokeWidth={1.5}
            />
          )}
        </div>
        <h2 className="mt-4 flex items-start justify-between gap-3 text-xl leading-snug font-semibold text-ink">
          {linkedArticle.title}
          <ArrowRight className="mt-1 size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
        </h2>
        {linkedArticle.excerpt ? (
          <p className="mt-2 line-clamp-3 text-base leading-relaxed text-ink-soft">
            {linkedArticle.excerpt}
          </p>
        ) : null}
      </Link>
    </aside>
  );
}
