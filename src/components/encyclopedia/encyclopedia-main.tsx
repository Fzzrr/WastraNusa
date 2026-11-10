'use client';

import {
  EncyclopediaArticleCard,
  EncyclopediaFeaturedCard,
  EncyclopediaPagination,
  EncyclopediaSidebar,
  EncyclopediaStats,
} from '@/components/encyclopedia';
import { EncyclopediaHero } from '@/components/encyclopedia/encyclopedia-hero';
import { Reveal } from '@/components/reveal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles } from '@/hooks/use-article';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  SEARCH_RESULT_LIMIT,
  searchArticles as filterArticlesByQuery,
} from '@/lib/search-filters';
import type { Stat } from '@/types/encyclopedia';
import { Home, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ARTICLES_PER_PAGE = 10;

interface EncyclopediaMainProps {
  initialIsland?: string;
  initialTopic?: string;
  initialSearch?: string;
}

function EncyclopediaStatsSkeleton() {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-10 w-14 rounded-none bg-surface" />
          <Skeleton className="h-4 w-16 rounded-none bg-surface" />
        </div>
      ))}
    </div>
  );
}

function EncyclopediaSidebarSkeleton() {
  return (
    <aside className="flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-surface p-4">
        <Skeleton className="mb-3 h-5 w-28 bg-surface" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full bg-surface" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <Skeleton className="mb-3 h-5 w-20 bg-surface" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-24 bg-surface" />
          ))}
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-xl bg-surface" />
    </aside>
  );
}

function EncyclopediaFeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid md:grid-cols-[320px_minmax(0,1fr)]">
        <Skeleton className="h-[220px] w-full rounded-none bg-surface" />
        <div className="p-5">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-6 w-20 bg-surface" />
            <Skeleton className="h-6 w-24 bg-surface" />
          </div>
          <Skeleton className="h-9 w-4/5 bg-surface" />
          <Skeleton className="mt-2 h-9 w-3/5 bg-surface" />
          <Skeleton className="mt-3 h-4 w-full bg-surface" />
          <Skeleton className="mt-2 h-4 w-5/6 bg-surface" />
          <Skeleton className="mt-4 h-10 w-40 rounded-xl bg-surface" />
        </div>
      </div>
    </div>
  );
}

function EncyclopediaArticleGridSkeleton() {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="h-44 w-full rounded-none bg-surface" />
          <div className="p-4">
            <div className="flex gap-1">
              <Skeleton className="h-5 w-20 bg-surface" />
              <Skeleton className="h-5 w-20 bg-surface" />
            </div>
            <Skeleton className="mt-2 h-8 w-11/12 bg-surface" />
            <Skeleton className="mt-2 h-8 w-3/4 bg-surface" />
            <Skeleton className="mt-3 h-4 w-full bg-surface" />
            <Skeleton className="mt-2 h-4 w-5/6 bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EncyclopediaMain({
  initialIsland,
  initialTopic,
  initialSearch,
}: EncyclopediaMainProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIsland, setSelectedIsland] = useState(initialIsland);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [searchTerm, setSearchTerm] = useState(initialSearch ?? '');
  const { data, error, isPending } = useArticles(
    currentPage,
    ARTICLES_PER_PAGE,
    {
      island: selectedIsland,
      topic: selectedTopic,
    },
  );

  // Search runs in the database and only while the user is searching.
  const serverSearch = useDebouncedValue(searchTerm.trim());
  const { data: searchData } = useArticles(
    1,
    SEARCH_RESULT_LIMIT,
    { q: serverSearch },
    { enabled: serverSearch.length > 0 },
  );

  const articles = data?.items ?? [];
  const searchArticles = searchData?.items ?? [];
  const islands = data?.meta.islands ?? [];
  const topics = data?.meta.topics ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const showLoadingSkeleton = isPending && !data;
  const stats: Stat[] = [
    {
      value: String(
        data?.meta.stats?.totalArticles ?? data?.meta.totalItems ?? 0,
      ),
      label: 'Artikel',
    },
    {
      value: String(
        data?.meta.stats?.totalIslands ?? Math.max(islands.length - 1, 0),
      ),
      label: 'Pulau',
    },
    {
      value: String(data?.meta.stats?.totalProvinces ?? 0),
      label: 'Provinsi',
    },
    {
      value: String(data?.meta.stats?.totalWastraTypes ?? 0),
      label: 'Wastra',
    },
  ];

  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length > 0;
  const searchResults = isSearching
    ? filterArticlesByQuery(searchArticles, normalizedSearch)
    : [];

  const featuredArticle =
    !isSearching && currentPage === 1 && !selectedIsland && !selectedTopic
      ? (articles.find((article) => article.featured) ?? articles[0])
      : undefined;
  const standardArticles = featuredArticle
    ? articles.filter((article) => article.slug !== featuredArticle.slug)
    : articles;
  const displayedArticles = isSearching ? searchResults : standardArticles;

  const pushFilterQuery = (island?: string, topic?: string) => {
    const searchParams = new URLSearchParams();

    if (island) {
      searchParams.set('island', island);
    }

    if (topic) {
      searchParams.set('topic', topic);
    }

    const query = searchParams.toString();
    router.push(query ? `/encyclopedia?${query}` : '/encyclopedia');
  };

  const handleIslandClick = (island: string) => {
    const nextIsland = island === 'Semua Pulau' ? undefined : island;
    setCurrentPage(1);
    setSelectedIsland(nextIsland);
    pushFilterQuery(nextIsland, selectedTopic);
  };

  const handleTopicClick = (topic: string) => {
    const nextTopic = selectedTopic === topic ? undefined : topic;
    setCurrentPage(1);
    setSelectedTopic(nextTopic);
    pushFilterQuery(selectedIsland, nextTopic);
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setSelectedIsland(undefined);
    setSelectedTopic(undefined);
    setSearchTerm('');
    pushFilterQuery(undefined, undefined);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    pushFilterQuery(selectedIsland, selectedTopic);
  };

  const handleArticleClick = (article: (typeof articles)[number]) => {
    router.push(`/encyclopedia/${article.slug}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main>
      <section className="mx-auto w-full max-w-[1320px] px-4 pb-4 pt-7 md:px-6 lg:px-8">
        <div>
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList className="text-ink-soft text-[15px] font-medium">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    className="flex items-center gap-1.5 hover:text-ink"
                  >
                    <Home className="size-3.5" />
                    Beranda
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-ink">
                    Ensiklopedia
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* The lead card below already shows the featured article. */}
        <EncyclopediaHero
          articles={articles.filter(
            (article) => article.slug !== featuredArticle?.slug,
          )}
        >
          {showLoadingSkeleton ? (
            <EncyclopediaStatsSkeleton />
          ) : (
            <EncyclopediaStats stats={stats} tone="light" />
          )}
        </EncyclopediaHero>
      </section>

      <section className="pt-12 pb-4">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
          {/* Toolbar: article count + view toggle. Full width so the count
              aligns left with the sidebar and the toggle aligns right with the
              cards; this also lets the filter card and article cards share the
              same top edge inside the grid below. */}
          {showLoadingSkeleton ? (
            <div className="mb-4 flex h-9 items-center">
              <Skeleton className="h-5 w-44 bg-surface" />
            </div>
          ) : (
            <div className="mb-4 flex h-9 items-center justify-between">
              {isSearching ? (
                <p className="flex items-center gap-2 text-left text-base font-semibold text-ink">
                  <span>
                    {searchResults.length} hasil untuk &ldquo;
                    {normalizedSearch}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Hapus pencarian"
                    title="Hapus pencarian"
                    className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                </p>
              ) : (
                <p className="text-[15px] text-ink-soft tabular-nums">
                  {data?.meta.totalItems ?? articles.length} artikel
                </p>
              )}
            </div>
          )}

          <div className="grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
            {showLoadingSkeleton ? (
              <EncyclopediaSidebarSkeleton />
            ) : (
              <EncyclopediaSidebar
                islands={islands}
                topics={topics}
                selectedIsland={selectedIsland}
                selectedTopic={selectedTopic}
                onIslandClick={handleIslandClick}
                onTopicClick={handleTopicClick}
                onResetFilters={handleResetFilters}
              />
            )}

            <div>
              {isPending && !showLoadingSkeleton ? (
                <p className="mt-4 text-[15px] text-ink-soft">Memuat…</p>
              ) : null}

              {!isPending && error ? (
                <p className="mt-4 bg-destructive/10 p-5 text-[15px] text-destructive">
                  Gagal memuat artikel. Coba muat ulang halaman.
                </p>
              ) : null}

              {showLoadingSkeleton ? <EncyclopediaFeaturedSkeleton /> : null}

              {!isPending && !error && featuredArticle ? (
                <EncyclopediaFeaturedCard
                  article={featuredArticle}
                  onReadMore={handleArticleClick}
                />
              ) : null}

              {showLoadingSkeleton ? <EncyclopediaArticleGridSkeleton /> : null}

              <Reveal className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {!isPending &&
                  !error &&
                  displayedArticles.map((article) => (
                    <EncyclopediaArticleCard
                      key={article.slug}
                      article={article}
                      onClick={handleArticleClick}
                    />
                  ))}

                {!isPending &&
                  !error &&
                  !featuredArticle &&
                  displayedArticles.length === 0 && (
                    <div className="bg-surface p-6 text-[15px] text-ink-soft sm:col-span-2 xl:col-span-3">
                      {isSearching
                        ? `Tidak ada artikel yang cocok dengan "${normalizedSearch}".`
                        : 'Belum ada artikel.'}
                    </div>
                  )}
              </Reveal>

              {!isSearching && totalPages > 1 ? (
                <EncyclopediaPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
