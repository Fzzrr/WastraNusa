'use client';

import { EncyclopediaPagination } from '@/components/encyclopedia';
import { useLikedArticles } from '@/hooks/use-article';
import { useState } from 'react';

import { LikedArticlesList } from './liked-articles-list';

const LIKED_ARTICLES_PER_PAGE = 5;

export function LikedArticlesMain() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isPending } = useLikedArticles(
    currentPage,
    LIKED_ARTICLES_PER_PAGE,
  );
  const articles = data?.items ?? [];
  const activePage = data?.meta.page ?? currentPage;
  const totalItems = data?.meta.totalItems ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2d5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#e8e2d5] px-6 py-5">
        <h2 className="m-0 text-[18px] font-bold text-[#5c7365]">
          Artikel Disukai
        </h2>
        {!isPending ? (
          <span className="rounded-full bg-[#eef3ef] px-3 py-1 text-xs font-semibold text-[#5c7365]">
            {totalItems} Artikel
          </span>
        ) : null}
      </div>

      <div className="p-6">
        {isPending ? (
          <div className="flex flex-col gap-3.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 rounded-xl border border-[#ece7dd] bg-[#fcfbf9] p-3.5"
              >
                <div className="h-[60px] w-[60px] rounded-lg bg-[#efe8db]" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-28 rounded bg-[#efe8db]" />
                  <div className="h-4 w-3/4 rounded bg-[#f2ede4]" />
                  <div className="h-3 w-full rounded bg-[#f6f2ea]" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isPending && error ? (
          <div className="rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-6 text-sm text-[#8b5e4a]">
            Gagal memuat artikel yang kamu sukai. Silakan coba lagi.
          </div>
        ) : null}

        {!isPending && !error ? (
          <>
            <LikedArticlesList articles={articles} />
            {totalPages > 1 ? (
              <EncyclopediaPagination
                currentPage={activePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
