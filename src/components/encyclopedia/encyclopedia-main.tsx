'use client';

import {
  EncyclopediaArticleCard,
  EncyclopediaArticleListCard,
  EncyclopediaFeaturedCard,
  EncyclopediaPagination,
  EncyclopediaSidebar,
  EncyclopediaStats,
} from '@/components/encyclopedia';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles } from '@/hooks/use-article';
import { searchArticles as filterArticlesByQuery } from '@/lib/search-filters';
import type { Stat } from '@/types/encyclopedia';
import { Grid3x3, Menu, X } from 'lucide-react';
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
    <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#d8d0c1] pt-5 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-[#ddd3c2] bg-[#f7f3ea]/70 px-4 py-3"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-[#e6dfd1]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-10 bg-[#e6dfd1]" />
            <Skeleton className="h-3 w-24 bg-[#e6dfd1]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EncyclopediaSidebarSkeleton() {
  return (
    <aside className="flex flex-col gap-3">
      <div className="rounded-2xl border border-[#d4cbbc] bg-[#f7f3ea] p-4">
        <Skeleton className="mb-3 h-5 w-28 bg-[#e6dfd1]" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full bg-[#e6dfd1]" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d4cbbc] bg-[#f7f3ea] p-4">
        <Skeleton className="mb-3 h-5 w-20 bg-[#e6dfd1]" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-24 bg-[#e6dfd1]" />
          ))}
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-xl bg-[#e6dfd1]" />
    </aside>
  );
}

function EncyclopediaFeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d5ccbc] bg-[#faf8f2]">
      <div className="grid md:grid-cols-[320px_minmax(0,1fr)]">
        <Skeleton className="h-[220px] w-full rounded-none bg-[#ece1d0]" />
        <div className="p-5">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-6 w-20 bg-[#e6dfd1]" />
            <Skeleton className="h-6 w-24 bg-[#e6dfd1]" />
          </div>
          <Skeleton className="h-9 w-4/5 bg-[#e6dfd1]" />
          <Skeleton className="mt-2 h-9 w-3/5 bg-[#e6dfd1]" />
          <Skeleton className="mt-3 h-4 w-full bg-[#e6dfd1]" />
          <Skeleton className="mt-2 h-4 w-5/6 bg-[#e6dfd1]" />
          <Skeleton className="mt-4 h-10 w-40 rounded-xl bg-[#e6dfd1]" />
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
          className="overflow-hidden rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2]"
        >
          <Skeleton className="h-44 w-full rounded-none bg-[#ece1d0]" />
          <div className="p-4">
            <div className="flex gap-1">
              <Skeleton className="h-5 w-20 bg-[#e6dfd1]" />
              <Skeleton className="h-5 w-20 bg-[#e6dfd1]" />
            </div>
            <Skeleton className="mt-2 h-8 w-11/12 bg-[#e6dfd1]" />
            <Skeleton className="mt-2 h-8 w-3/4 bg-[#e6dfd1]" />
            <Skeleton className="mt-3 h-4 w-full bg-[#e6dfd1]" />
            <Skeleton className="mt-2 h-4 w-5/6 bg-[#e6dfd1]" />
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data, error, isPending } = useArticles(
    currentPage,
    ARTICLES_PER_PAGE,
    {
      island: selectedIsland,
      topic: selectedTopic,
    },
  );

  // Fetch all articles for search (large limit)
  const { data: searchData } = useArticles(1, 500);

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
      label: 'Total Artikel',
    },
    {
      value: String(
        data?.meta.stats?.totalIslands ?? Math.max(islands.length - 1, 0),
      ),
      label: 'Pulau Tercakup',
    },
    {
      value: String(data?.meta.stats?.totalProvinces ?? 0),
      label: 'Provinsi Tercakup',
    },
    {
      value: String(data?.meta.stats?.totalWastraTypes ?? 0),
      label: 'Jenis Wastra',
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
              <BreadcrumbList className="text-[#6e8276] text-sm font-medium">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="hover:text-[#2f5b49]">
                    Beranda
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#2f5b49]">
                    Ensiklopedia Budaya
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2f5b49]">
              Ensiklopedia Budaya Wastra
            </h1>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#2f5b49] to-[#caa86a]" />
            <p className="mt-3 text-sm max-w-2xl text-medium leading-relaxed text-[#4d6759]">
              Jelajahi kekayaan pengetahuan wastra tradisional Indonesia dari
              teknik tenun hingga makna filosofi setiap motif kain.
            </p>
          </div>
        </div>

        {showLoadingSkeleton ? (
          <EncyclopediaStatsSkeleton />
        ) : (
          <EncyclopediaStats stats={stats} />
        )}
      </section>

      <section className="border-y border-[#d3cbbd] bg-[#e9e4d9] py-6">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
          {/* Toolbar: article count + view toggle. Full width so the count
              aligns left with the sidebar and the toggle aligns right with the
              cards; this also lets the filter card and article cards share the
              same top edge inside the grid below. */}
          {showLoadingSkeleton ? (
            <div className="mb-4 flex h-9 items-center">
              <Skeleton className="h-5 w-44 bg-[#e6dfd1]" />
            </div>
          ) : (
            <div className="mb-4 flex h-9 items-center justify-between">
              {isSearching ? (
                <p className="flex items-center gap-2 text-left text-sm font-semibold text-[#4e6659]">
                  <span>
                    {searchResults.length} hasil untuk &ldquo;
                    {normalizedSearch}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-1 rounded-full border border-[#cdbfa8] bg-[#f7f3ea] px-2 py-0.5 text-xs font-medium text-[#4c6457] transition hover:bg-[#ece5d8]"
                  >
                    <X className="h-3 w-3" />
                    Hapus
                  </button>
                </p>
              ) : (
                <p className="text-left text-sm font-semibold text-[#4e6659]">
                  Menampilkan {data?.meta.totalItems ?? articles.length} artikel
                </p>
              )}
              <div className="flex gap-1.5 rounded-sm border border-[#d4cbbc] bg-[#f7f3ea] p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 transition-all active:scale-90 ${
                    viewMode === 'grid'
                      ? 'bg-[#2f5f49] text-[#eef3ea] hover:bg-[#2f5f49]/90 hover:text-[#eef3ea]'
                      : 'text-[#4c6457] hover:bg-[#ece5d8]'
                  }`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 transition-all active:scale-90 ${
                    viewMode === 'list'
                      ? 'bg-[#2f5f49] text-[#eef3ea] hover:bg-[#2f5f49]/90 hover:text-[#eef3ea]'
                      : 'text-[#4c6457] hover:bg-[#ece5d8]'
                  }`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
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
                <div className="mt-4 rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] p-6 text-sm text-[#4f6658]">
                  Memuat artikel ensiklopedia...
                </div>
              ) : null}

              {!isPending && error ? (
                <div className="mt-4 rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-6 text-sm text-[#8b5e4a]">
                  Gagal memuat artikel. Silakan coba lagi.
                </div>
              ) : null}

              {showLoadingSkeleton ? <EncyclopediaFeaturedSkeleton /> : null}

              {!isPending && !error && featuredArticle ? (
                <EncyclopediaFeaturedCard
                  article={featuredArticle}
                  viewMode={viewMode}
                  onReadMore={handleArticleClick}
                />
              ) : null}

              {showLoadingSkeleton ? <EncyclopediaArticleGridSkeleton /> : null}

              <div
                className={`mt-4 ${
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-3'
                }`}
              >
                {!isPending &&
                  !error &&
                  displayedArticles.map((article) =>
                    viewMode === 'list' ? (
                      <EncyclopediaArticleListCard
                        key={article.slug}
                        article={article}
                        onClick={handleArticleClick}
                      />
                    ) : (
                      <EncyclopediaArticleCard
                        key={article.slug}
                        article={article}
                        onClick={handleArticleClick}
                      />
                    ),
                  )}

                {!isPending &&
                  !error &&
                  !featuredArticle &&
                  displayedArticles.length === 0 && (
                    <div className="rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] p-6 text-sm text-[#4f6658] sm:col-span-2 xl:col-span-3">
                      {isSearching
                        ? `Tidak ada artikel yang cocok dengan "${normalizedSearch}".`
                        : 'Belum ada artikel ensiklopedia yang tersedia.'}
                    </div>
                  )}
              </div>

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
