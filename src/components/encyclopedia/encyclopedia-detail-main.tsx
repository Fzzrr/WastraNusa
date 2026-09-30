'use client';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Separator removed: sections now use border-top for separation
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleDetail, useToggleArticleLike } from '@/hooks/use-article';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock3,
  Compass,
  Eye,
  Hash,
  Heart,
  type LucideIcon,
  MessageCircle,
  Quote,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { EncyclopediaChatSidebarCard } from './encyclopedia-chat-sidebar-card';
import { EncyclopediaChatWidget } from './encyclopedia-chat-widget';

const sideCardClassName =
  'rounded-2xl border-0 bg-[#fbf8f2] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e6dccb]';

function SideCardTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: string;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-[#355645]">
      <span className="flex size-7 items-center justify-center rounded-lg bg-[#f5ead3] text-[#a07a2c]">
        <Icon className="size-3.5" />
      </span>
      {children}
    </h3>
  );
}

function HeroMeta({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 py-1 pr-3 pl-1 ring-1 ring-white/20 backdrop-blur-md">
      <span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-[#f8f3e8]">
        <Icon className="size-3.5" />
      </span>
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
  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Gagal memuat detail artikel. Silakan coba lagi.';

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-6 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-16 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-3 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-28 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-3 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-40 bg-[#e6dfd1]" />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#dacfbf] bg-[#ece1d0]">
          <div className="relative min-h-[340px] border-b border-dashed border-[#d8ccbb] p-5 md:p-6">
            <div className="mt-auto flex h-full flex-col justify-end">
              <div className="mb-3 flex gap-2">
                <Skeleton className="h-6 w-24 rounded bg-[#d9cfbe]" />
                <Skeleton className="h-6 w-24 rounded bg-[#d9cfbe]" />
              </div>
              <Skeleton className="h-9 w-full max-w-2xl bg-[#d9cfbe]" />
              <Skeleton className="mt-2 h-9 w-full max-w-xl bg-[#d9cfbe]" />
              <div className="mt-5 flex flex-wrap gap-3">
                <Skeleton className="h-4 w-24 bg-[#d9cfbe]" />
                <Skeleton className="h-4 w-28 bg-[#d9cfbe]" />
                <Skeleton className="h-4 w-24 bg-[#d9cfbe]" />
                <Skeleton className="h-4 w-24 bg-[#d9cfbe]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-[#f4efe5] p-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-[#e6dfd1]" />
              <Skeleton className="h-6 w-24 rounded-full bg-[#e6dfd1]" />
              <Skeleton className="h-6 w-20 rounded-full bg-[#e6dfd1]" />
            </div>
            <Skeleton className="size-8 rounded-full bg-[#e6dfd1]" />
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article>
            <div className="rounded-xl border border-[#e1d8c9] bg-[#f8f3ea] p-4">
              <Skeleton className="h-5 w-40 bg-[#e6dfd1]" />
              <Skeleton className="mt-2 h-4 w-full bg-[#e6dfd1]" />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
              <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
              <Skeleton className="h-4 w-11/12 bg-[#e6dfd1]" />
            </div>

            <div className="mt-9">
              <Skeleton className="h-10 w-2/3 bg-[#e6dfd1]" />
              <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
                  <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
                  <Skeleton className="h-4 w-10/12 bg-[#e6dfd1]" />
                </div>
                <Skeleton className="h-[220px] w-full rounded-xl bg-[#e6dfd1]" />
              </div>
            </div>
          </article>

          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-[#ddd2bf] bg-[#f7f3ea] p-4">
              <Skeleton className="h-5 w-28 bg-[#e6dfd1]" />
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-8 w-full bg-[#e6dfd1]" />
                <Skeleton className="h-8 w-full bg-[#e6dfd1]" />
                <Skeleton className="h-8 w-full bg-[#e6dfd1]" />
              </div>
            </div>

            <div className="rounded-xl border border-[#ddd2bf] bg-[#f7f3ea] p-4">
              <Skeleton className="h-5 w-32 bg-[#e6dfd1]" />
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
                <Skeleton className="h-4 w-5/6 bg-[#e6dfd1]" />
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
        <p className="text-sm text-[#8b5e4a]">{errorMessage}</p>
      </main>
    );
  }

  const hasRelatedProducts = article.relatedProducts.length > 0;
  const nextArticleHref = article.nextArticle.slug
    ? `/encyclopedia/${article.nextArticle.slug}`
    : '/encyclopedia';
  const nextArticleDescription = article.nextArticle.slug
    ? 'Lanjutkan baca artikel terkait'
    : 'Kembali ke daftar ensiklopedia';
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
        <BreadcrumbList className="text-sm font-medium text-[#6e8276]">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="hover:text-[#2f5b49]">
              Beranda
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/encyclopedia"
              className="hover:text-[#2f5b49]"
            >
              Ensiklopedia Budaya
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1 max-w-[280px] text-[#2f5b49]">
              {article.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="group/hero mt-4 animate-in overflow-hidden rounded-3xl bg-[#ece1d0] shadow-[0_24px_48px_-28px_rgba(74,60,47,0.55)] ring-1 ring-[#dacfbf] duration-500 fade-in slide-in-from-bottom-2">
        <div className="relative min-h-[340px] overflow-hidden md:min-h-[380px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_22%,rgba(242,229,205,0.9)_0%,rgba(218,202,178,0.72)_42%,rgba(154,133,108,0.88)_100%)]" />

          {article.imageURL ? (
            <Image
              src={article.imageURL}
              alt={article.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-[1500ms] ease-out group-hover/hero:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-2 text-[#5f503e]">
                <span className="h-5 w-5 rotate-45 border border-[#ccbda4]" />
                <span className="text-sm font-medium">
                  {article.motifLabel}
                </span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#2c241c]/95 via-[#3f3326]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c241c]/50 via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="rounded-full bg-[#caa86a] px-3 py-1 text-[11px] font-semibold text-[#2c241c] hover:bg-[#caa86a]">
                <Sparkles className="size-3" />
                {article.topic}
              </Badge>
              <Badge className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-[#f8f3e8] ring-1 ring-white/25 backdrop-blur-md hover:bg-white/15">
                {article.region}
              </Badge>
            </div>

            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-[#f8f3e8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] md:text-5xl">
              {article.title}
            </h1>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#caa86a] to-[#f3dfb4]" />

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#f1e9dc]">
              <HeroMeta icon={UserRound}>{article.author}</HeroMeta>
              <HeroMeta icon={CalendarDays}>{article.publishedAt}</HeroMeta>
              <HeroMeta icon={Clock3}>
                {article.readMinutes ?? 8} Menit Baca
              </HeroMeta>
              <HeroMeta icon={Eye}>{article.views} Kunjungan</HeroMeta>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 bg-[#f7f2e9] px-4 py-3.5 md:px-6">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full border-[#e0d6c5] bg-[#fbf8f2] px-2.5 py-1 text-xs font-semibold text-[#a07a5c] transition-colors hover:border-[#caa86a] hover:bg-[#f5ead3] hover:text-[#7a5a2c]"
              >
                <Hash className="size-3 text-[#caa86a]" />
                {tag}
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-9 cursor-pointer gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-all active:scale-95',
              isLiked
                ? 'border-[#2f5f49] bg-[#2f5f49] text-white hover:bg-[#274f3d] hover:text-white'
                : 'border-[#d8cfbe] bg-[#fbf8f2] text-[#7f7467] hover:border-[#2f5f49] hover:text-[#2f5f49]',
            )}
            onClick={handleToggleLike}
            disabled={toggleLikeMutation.isPending || isSessionPending}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Batalkan suka artikel' : 'Sukai artikel'}
          >
            <Heart
              className={cn(
                'size-4 transition-transform',
                isLiked && 'scale-110 fill-current',
              )}
            />
            {article.likes}
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#f5ead3]/70 to-[#fbf8f2] p-5 ring-1 ring-[#e6d6b8]">
            <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#caa86a] to-[#2f5b49]" />
            <Quote className="pointer-events-none absolute -top-2 right-3 size-16 rotate-180 text-[#caa86a]/15" />
            <p className="relative inline-flex items-start gap-3 text-justify text-[15px] leading-relaxed text-[#5a5244] italic">
              <Quote className="mt-0.5 size-5 shrink-0 text-[#caa86a]" />
              {article.excerpt}
            </p>
          </Card>

          <p className="mt-7 text-justify text-[15px] leading-8 text-[#3d5449] first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:text-6xl first-letter:leading-[0.8] first-letter:font-bold first-letter:text-[#2f5b49]">
            {article.intro}
          </p>

          {article.description && (
            <p className="mt-4 text-[15px] leading-8 text-[#4d6058]">
              {article.description}
            </p>
          )}

          {article.sections.map((section, index) => {
            const showVisual = Boolean(
              section.imageURL || section.imageCaption || section.imageLabel,
            );
            const visualLabel = section.imageLabel ?? article.motifLabel;
            const visualCaption =
              section.imageCaption ?? `Visual ${visualLabel} dari artikel.`;

            return (
              <section
                key={section.title}
                className="group/section mt-10 border-t border-[#e6ddd0] pt-7"
              >
                <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-[#2f5b49]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2f5b49] text-sm font-bold text-[#e8cb8d] shadow-[0_6px_14px_-6px_rgba(47,91,73,0.6)] transition-transform duration-300 group-hover/section:-rotate-6">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </h2>

                <div className="mt-5 grid items-stretch gap-6 md:grid-cols-[1fr_240px] lg:grid-cols-[1fr_280px]">
                  <div className="space-y-4">
                    {section.content.split('\n\n').map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-justify text-[15px] leading-8 text-[#465d51]"
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>

                  {showVisual ? (
                    <Card className="group/visual flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-[#f5f1e8] p-0 shadow-[0_18px_40px_rgba(85,68,48,0.10)] ring-1 ring-[#d8ccb9] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(85,68,48,0.18)]">
                      <div className="relative min-h-[160px] w-full flex-1 overflow-hidden bg-[#ece1d0]">
                        {section.imageURL ? (
                          <Image
                            src={section.imageURL}
                            alt={visualCaption}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 ease-out group-hover/visual:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 280px, 280px"
                            priority={false}
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center">
                            <div className="flex flex-col items-center gap-2 text-[#6f604e]">
                              <span className="h-4 w-4 rotate-45 border border-[#ccbda4]" />
                              <span className="text-sm font-medium">
                                {section.imageLabel ?? article.motifLabel}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#433528]/85 via-[#433528]/20 to-transparent" />
                        {section.imageCaption ? (
                          <p className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-xs text-[#f8f3e8]">
                            {section.imageCaption}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  ) : null}
                </div>
              </section>
            );
          })}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <EncyclopediaChatSidebarCard onOpenChat={() => setIsChatOpen(true)} />

          <Card className={cn(sideCardClassName, 'gap-0 overflow-hidden py-0')}>
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#2f5f49] to-[#3f7359] px-4 py-3">
              <Compass className="size-4 text-[#e8cb8d]" />
              <h3 className="text-sm font-bold text-[#eef3eb]">Fakta Kunci</h3>
            </div>

            <div className="divide-y divide-[#ece3d4]">
              {article.keyFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 px-4 py-3 text-xs transition-colors hover:bg-[#f5ead3]/50"
                >
                  <span className="text-[#7b857e]">{fact.label}</span>
                  <span className="font-semibold text-[#2f4f40]">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {hasRelatedProducts ? (
            <Card className={cn(sideCardClassName, 'gap-3 p-4')}>
              <SideCardTitle icon={ShoppingBag}>Produk Terkait</SideCardTitle>
              <div className="space-y-2.5">
                {article.relatedProducts.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/catalog/${product.slug}`}
                    className="group/product flex items-center gap-3 rounded-xl bg-[#f3ece0] p-3 ring-1 ring-[#e6dccb] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fffdf8] hover:shadow-[0_12px_24px_-16px_rgba(47,91,73,0.5)] hover:ring-[#caa86a]/60"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#e8ddcc]">
                      {product.imageURL ? (
                        <Image
                          src={product.imageURL}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover/product:scale-110"
                          sizes="80px"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="flex flex-col items-center gap-1.5 text-[#6f604e]">
                            <span className="h-4 w-4 rotate-45 border border-[#b7a387]" />
                            <span className="text-[9px] font-medium">Foto</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug font-semibold text-[#365746] transition-colors group-hover/product:text-[#2f5b49]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[#7d7a70]">
                        {product.location}
                      </p>
                      <p className="mt-2 flex items-center justify-between text-sm font-bold text-[#2f5f49]">
                        {product.price}
                        <ArrowRight className="size-4 -translate-x-1 text-[#caa86a] opacity-0 transition-all group-hover/product:translate-x-0 group-hover/product:opacity-100" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className={cn(sideCardClassName, 'gap-3 p-4')}>
            <SideCardTitle icon={BarChart3}>Statistik Artikel</SideCardTitle>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#e3ece5] p-3 text-center transition-transform hover:-translate-y-0.5">
                <Eye className="mx-auto size-4 text-[#2f5f49]" />
                <p className="mt-1 text-xl font-bold text-[#2f5f49] tabular-nums">
                  {article.views}
                </p>
                <p className="text-[11px] text-[#677a6e]">Kunjungan</p>
              </div>
              <div className="rounded-xl bg-[#f6e4da] p-3 text-center transition-transform hover:-translate-y-0.5">
                <Heart className="mx-auto size-4 text-[#b8613f]" />
                <p className="mt-1 text-xl font-bold text-[#b8613f] tabular-nums">
                  {article.likes}
                </p>
                <p className="text-[11px] text-[#8a6f62]">Disukai</p>
              </div>
            </div>
          </Card>

          <Card className={cn(sideCardClassName, 'gap-3 p-4')}>
            <SideCardTitle icon={Compass}>Navigasi Artikel</SideCardTitle>
            <Button
              asChild
              className="group/next h-auto w-full justify-between rounded-xl bg-[#2f5b49] px-4 py-3 text-sm text-white shadow-[0_8px_18px_-10px_rgba(47,91,73,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#274f3d]"
            >
              <Link href={nextArticleHref}>
                <span className="line-clamp-1 text-left">
                  {article.nextArticle.title}
                </span>
                <ChevronRight className="size-4 transition-transform group-hover/next:translate-x-1" />
              </Link>
            </Button>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#6f7a73]">
              <MessageCircle className="size-3.5" />
              {nextArticleDescription}
            </div>
          </Card>
        </aside>
      </section>

      <EncyclopediaChatWidget
        articleId={article.slug}
        articleTitle={article.title}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </main>
  );
}
