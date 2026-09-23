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
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  MessageCircle,
  Quote,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

type EncyclopediaDetailMainProps = {
  slug: string;
};

export function EncyclopediaDetailMain({ slug }: EncyclopediaDetailMainProps) {
  const { data: article, error, isPending } = useArticleDetail(slug);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const toggleLikeMutation = useToggleArticleLike(slug);
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

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#dacfbf] bg-[#ece1d0]">
        <div className="relative min-h-[340px] border-b border-dashed border-[#d8ccbb]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_22%,rgba(242,229,205,0.9)_0%,rgba(218,202,178,0.72)_42%,rgba(154,133,108,0.88)_100%)]" />

          {article.imageURL ? (
            <Image
              src={article.imageURL}
              alt={article.title}
              fill
              unoptimized
              className="object-cover mix-blend-overlay"
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

          <div className="absolute inset-0 bg-gradient-to-t from-[#4a3c2f]/90 via-[#5a4a3a]/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="rounded bg-[#efe2d8] px-2 py-1 text-[11px] text-[#c17f61] hover:bg-[#efe2d8]">
                {article.topic}
              </Badge>
              <Badge className="rounded bg-[#ece6d9] px-2 py-1 text-[11px] text-[#b39f86] hover:bg-[#ece6d9]">
                {article.region}
              </Badge>
            </div>

            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-[#f8f3e8] md:text-5xl">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-[#ded4c4]">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15 text-[#f8f3e8]">
                  <UserRound className="size-3.5" />
                </span>
                {article.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15 text-[#f8f3e8]">
                  <CalendarDays className="size-3.5" />
                </span>
                {article.publishedAt}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15 text-[#f8f3e8]">
                  <Clock3 className="size-3.5" />
                </span>
                {article.readMinutes ?? 8}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15 text-[#f8f3e8]">
                  <Eye className="size-3.5" />
                </span>
                {article.views}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f4efe5] p-4">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full border-[#e0d6c5] bg-[#efe8dc] px-2.5 py-0.5 text-xs font-semibold text-[#b48464] hover:bg-[#e9e1d2]"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`h-8 w-8 rounded-full border-[#d8cfbe] ${
              isLiked
                ? 'text-[#2f5f49] hover:text-[#2f5f49]'
                : 'text-[#7f7467] hover:text-[#2f5f49]'
            }`}
            onClick={handleToggleLike}
            disabled={toggleLikeMutation.isPending || isSessionPending}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Batalkan suka artikel' : 'Sukai artikel'}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <Card className="rounded-xl border border-[#e1d8c9] bg-[#f8f3ea] p-4">
            <p className="inline-flex items-start gap-2 text-sm leading-relaxed text-[#5f6c63] italic">
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-[#97a694]" />
              {article.excerpt}
            </p>
          </Card>

          <p className="mt-6 text-[15px] leading-8 text-[#3d5449]">
            {article.intro}
          </p>

          {article.description && (
            <p className="mt-4 text-[15px] leading-8 text-[#4d6058]">
              {article.description}
            </p>
          )}

          {article.sections.map((section) => {
            const showVisual = Boolean(
              section.imageURL || section.imageCaption || section.imageLabel,
            );
            const visualLabel = section.imageLabel ?? article.motifLabel;
            const visualCaption =
              section.imageCaption ?? `Visual ${visualLabel} dari artikel.`;

            return (
              <section
                key={section.title}
                className="mt-9 border-t border-[#e6ddd0] pt-6"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-[#2f5b49] pl-4 border-l-4 border-[#d7e6db]">
                  {section.title}
                </h2>

                <div className="mt-3">
                  {showVisual ? (
                    <Card className="md:float-right md:ml-5 lg:ml-5 w-full md:w-60 lg:w-72 overflow-hidden rounded-2xl border border-[#d8ccb9] bg-[#f5f1e8] shadow-[0_18px_40px_rgba(85,68,48,0.08)] mb-5 md:mb-0">
                      <div className="relative w-full bg-[#ece1d0] aspect-square">
                        {section.imageURL ? (
                          <Image
                            src={section.imageURL}
                            alt={visualCaption}
                            fill
                            unoptimized
                            className="object-cover"
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

                        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
                          <span className="rounded-full border border-white/40 bg-[#f6efe3]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5a49] backdrop-blur-sm">
                            {visualLabel}
                          </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#433528]/85 via-[#433528]/20 to-transparent" />
                      </div>

                      <div className="space-y-1 px-3 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b775e]">
                          Visual Section
                        </p>
                        <p className="text-xs leading-5 text-[#5b5f59]">
                          {visualCaption}
                        </p>
                      </div>
                    </Card>
                  ) : null}

                  <div className="space-y-4">
                    {section.content.split('\n\n').map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-[15px] leading-8 text-[#465d51]"
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>

                  <div className="clear-both" />
                </div>

                {/* border-top now handles separation between sections */}
              </section>
            );
          })}
        </article>

        <aside className="space-y-4">
          <Card className="overflow-hidden rounded-xl border border-[#ddd2bf] bg-[#f7f3ea]">
            <div className="bg-[#2f5f49] px-4 py-2">
              <h3 className="text-sm font-bold text-[#eef3eb]">Fakta Kunci</h3>
            </div>

            <div className="divide-y divide-[#e6ddd0]">
              {article.keyFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 px-4 py-2.5 text-xs"
                >
                  <span className="text-[#536a5e]">{fact.label}</span>
                  <span className="font-semibold text-[#2f4f40]">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {hasRelatedProducts ? (
            <Card className="rounded-xl border border-[#ddd2bf] bg-[#f7f3ea] p-4">
              <h3 className="text-sm font-bold text-[#355645]">
                Produk Terkait
              </h3>
              <div className="mt-1 space-y-2.5">
                {article.relatedProducts.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/catalog/${product.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-[#dfd4c2] bg-[#efe7da] p-3 transition-colors hover:bg-[#e9dfcf]"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-dashed border-[#d4c6b1] bg-[#e8ddcc]">
                      {product.imageURL ? (
                        <Image
                          src={product.imageURL}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
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
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_0%,rgba(111,96,78,0.12)_100%)] pointer-events-none" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-[#365746]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[#7d7a70]">
                        {product.location}
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#2f5f49]">
                        {product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="rounded-xl border border-[#ddd2bf] bg-[#f7f3ea] p-4">
            <h3 className="text-sm font-bold text-[#355645]">
              Statistik Artikel
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-[#e4dbcd] bg-[#f1ebdf] p-2 text-center">
                <p className="text-lg font-bold text-[#2f5f49]">
                  {article.views}
                </p>
                <p className="text-[11px] text-[#677a6e]">Kunjungan</p>
              </div>
              <div className="rounded-md border border-[#e4dbcd] bg-[#f1ebdf] p-2 text-center">
                <p className="text-lg font-bold text-[#2f5f49]">
                  {article.likes}
                </p>
                <p className="text-[11px] text-[#677a6e]">Disukai</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border border-[#ddd2bf] bg-[#f7f3ea] p-4">
            <h3 className="text-sm font-bold text-[#355645]">
              Navigasi Artikel
            </h3>
            <Button
              asChild
              className="mt-3 w-full justify-between rounded-md bg-[#ece5d9] px-3 py-2 text-sm text-[#385847] hover:bg-[#e3dbc9]"
            >
              <Link href={nextArticleHref}>
                <span className="line-clamp-1 text-left">
                  {article.nextArticle.title}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#6f7a73]">
              <MessageCircle className="h-3.5 w-3.5" />
              {nextArticleDescription}
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}
