'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
// Separator removed: sections now use border-top for separation
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleDetail, useToggleArticleLike } from '@/hooks/use-article';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Eye,
  Heart,
  ImageOff,
  type LucideIcon,
  MapPin,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { EncyclopediaChatWidget } from './encyclopedia-chat-widget';

function HeroMeta({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4" strokeWidth={1.75} />
      {children}
    </span>
  );
}

type EncyclopediaDetailMainProps = {
  slug: string;
};

export function EncyclopediaDetailMain({ slug }: EncyclopediaDetailMainProps) {
  const { data: article, error, isPending } = useArticleDetail(slug);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const toggleLikeMutation = useToggleArticleLike(slug);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Gagal memuat detail artikel. Silakan coba lagi.';

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-6 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-16 bg-surface" />
          <Skeleton className="h-4 w-3 bg-surface" />
          <Skeleton className="h-4 w-28 bg-surface" />
          <Skeleton className="h-4 w-3 bg-surface" />
          <Skeleton className="h-4 w-40 bg-surface" />
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="relative min-h-[340px] border-b border-dashed border-border p-5 md:p-6">
            <div className="mt-auto flex h-full flex-col justify-end">
              <div className="mb-3 flex gap-2">
                <Skeleton className="h-6 w-24 rounded bg-surface" />
                <Skeleton className="h-6 w-24 rounded bg-surface" />
              </div>
              <Skeleton className="h-9 w-full max-w-2xl bg-surface" />
              <Skeleton className="mt-2 h-9 w-full max-w-xl bg-surface" />
              <div className="mt-5 flex flex-wrap gap-3">
                <Skeleton className="h-4 w-24 bg-surface" />
                <Skeleton className="h-4 w-28 bg-surface" />
                <Skeleton className="h-4 w-24 bg-surface" />
                <Skeleton className="h-4 w-24 bg-surface" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-surface p-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-surface" />
              <Skeleton className="h-6 w-24 rounded-full bg-surface" />
              <Skeleton className="h-6 w-20 rounded-full bg-surface" />
            </div>
            <Skeleton className="size-8 rounded-full bg-surface" />
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article>
            <div className="rounded-xl border border-border bg-surface p-4">
              <Skeleton className="h-5 w-40 bg-surface" />
              <Skeleton className="mt-2 h-4 w-full bg-surface" />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Skeleton className="h-4 w-full bg-surface" />
              <Skeleton className="h-4 w-full bg-surface" />
              <Skeleton className="h-4 w-11/12 bg-surface" />
            </div>

            <div className="mt-9">
              <Skeleton className="h-10 w-2/3 bg-surface" />
              <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full bg-surface" />
                  <Skeleton className="h-4 w-full bg-surface" />
                  <Skeleton className="h-4 w-10/12 bg-surface" />
                </div>
                <Skeleton className="h-[220px] w-full rounded-xl bg-surface" />
              </div>
            </div>
          </article>

          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <Skeleton className="h-5 w-28 bg-surface" />
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-8 w-full bg-surface" />
                <Skeleton className="h-8 w-full bg-surface" />
                <Skeleton className="h-8 w-full bg-surface" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <Skeleton className="h-5 w-32 bg-surface" />
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-4 w-full bg-surface" />
                <Skeleton className="h-4 w-5/6 bg-surface" />
              </div>
            </div>
          </aside>
        </section>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-6 md:px-6 lg:px-8">
        <p className="text-base text-ink-soft">{errorMessage}</p>
      </main>
    );
  }

  const hasRelatedProducts = article.relatedProducts.length > 0;
  const nextArticleHref = article.nextArticle.slug
    ? `/encyclopedia/${article.nextArticle.slug}`
    : '/encyclopedia';
  const isLiked = Boolean(article.isLiked);

  const handleToggleLike = async () => {
    if (!session && !isSessionPending) {
      toast.error('Silakan login terlebih dahulu untuk menyukai artikel.');
      return;
    }

    try {
      await toggleLikeMutation.mutateAsync();
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Gagal memperbarui status suka artikel.';

      toast.error(message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-6 md:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList className="text-[15px] font-medium text-ink-soft">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="hover:text-ink">
              Beranda
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/encyclopedia" className="hover:text-ink">
              Ensiklopedia
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1 max-w-[280px] text-ink">
              {article.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="group/hero relative mt-4 min-h-[420px] animate-in overflow-hidden bg-field duration-500 fade-in md:min-h-[520px]">
        {article.imageURL && !heroImageFailed ? (
          <Image
            src={article.imageURL}
            alt={article.title}
            fill
            preload
            loading="eager"
            sizes="(min-width: 1320px) 1256px, 100vw"
            onError={() => setHeroImageFailed(true)}
            className="object-cover transition-transform duration-[1500ms] ease-out group-hover/hero:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-10">
          <h1 className="max-w-4xl text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-white">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[15px] text-white/85">
            <HeroMeta icon={MapPin}>{article.region}</HeroMeta>
            <HeroMeta icon={UserRound}>{article.author}</HeroMeta>
            <HeroMeta icon={CalendarDays}>{article.publishedAt}</HeroMeta>
            <HeroMeta icon={Clock3}>{article.readMinutes ?? 8} mnt</HeroMeta>
            <HeroMeta icon={Eye}>{article.views}</HeroMeta>
            <button
              type="button"
              className={cn(
                'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 font-semibold tabular-nums transition-colors active:scale-95 disabled:opacity-60',
                isLiked
                  ? 'bg-white text-ink'
                  : 'bg-white/15 text-white hover:bg-white/25',
              )}
              onClick={handleToggleLike}
              disabled={toggleLikeMutation.isPending || isSessionPending}
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Batalkan suka artikel' : 'Sukai artikel'}
            >
              <Heart
                className={cn(
                  'size-4 transition-transform',
                  isLiked && 'scale-110 fill-current text-destructive',
                )}
              />
              {article.likes}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="max-w-[68ch]">
          <p className="text-xl leading-relaxed text-ink md:text-2xl md:leading-snug">
            {article.excerpt}
          </p>

          <p className="mt-8 text-base leading-8 text-ink first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:text-6xl first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-brand">
            {article.intro}
          </p>

          {article.description && (
            <p className="mt-4 text-base leading-8 text-ink">
              {article.description}
            </p>
          )}

          {article.sections.map((section) => {
            const visualLabel = section.imageLabel ?? article.motifLabel;
            const visualCaption =
              section.imageCaption ?? `Visual ${visualLabel} dari artikel.`;

            return (
              <section key={section.title} className="mt-10">
                <h2 className="text-[clamp(1.5rem,2.4vw,1.875rem)] leading-tight font-semibold tracking-[-0.02em] text-ink">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-base leading-8 text-ink">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>

                {section.imageURL ? (
                  <figure className="mt-6">
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                      <Image
                        src={section.imageURL}
                        alt={visualCaption}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 680px, 100vw"
                      />
                    </div>
                    {section.imageCaption ? (
                      <figcaption className="mt-2 text-[13px] text-ink-soft">
                        {section.imageCaption}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </section>
            );
          })}
        </article>

        <aside className="space-y-10 lg:sticky lg:top-6 lg:self-start">
          {article.keyFacts.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-ink">Fakta</h2>
              <dl className="mt-4 space-y-3 text-[15px]">
                {article.keyFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-ink-soft">{fact.label}</dt>
                    <dd className="font-medium text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {hasRelatedProducts ? (
            <div>
              <h2 className="text-lg font-semibold text-ink">Produk terkait</h2>
              <ul className="mt-4 space-y-1">
                {article.relatedProducts.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/catalog/${product.slug}`}
                      className="group/product -mx-2 flex items-center gap-4 p-2 transition-colors hover:bg-surface"
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden bg-surface">
                        {product.imageURL ? (
                          <Image
                            src={product.imageURL}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <ImageOff
                            className="absolute inset-0 m-auto size-5 text-ink-soft"
                            strokeWidth={1.5}
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-[15px] leading-snug font-semibold text-ink group-hover/product:underline group-hover/product:underline-offset-4">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-[15px] font-bold text-ink tabular-nums">
                          {product.price}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {article.nextArticle.slug ? (
            <Link
              href={nextArticleHref}
              className="group/next block bg-surface p-5 transition-colors hover:bg-brand hover:text-on-field"
            >
              <span className="text-[13px] text-ink-soft group-hover/next:text-on-field-soft">
                Berikutnya
              </span>
              <span className="mt-1 flex items-start justify-between gap-3 text-lg leading-snug font-semibold">
                {article.nextArticle.title}
                <ArrowRight className="mt-1 size-5 shrink-0 transition-transform group-hover/next:translate-x-1" />
              </span>
            </Link>
          ) : null}
        </aside>
      </section>

      <EncyclopediaChatWidget
        key={article.slug}
        articleId={article.slug}
        articleTitle={article.title}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </main>
  );
}
