'use client';

import { EncyclopediaPagination } from '@/components/encyclopedia';
import {
  ProfileEmptyState,
  ProfileSection,
} from '@/components/profile/profile-section';
import { useLikedArticles } from '@/hooks/use-article';
import { Heart, XCircle } from 'lucide-react';
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
    <ProfileSection
      icon={Heart}
      title={
        <span className="flex items-center gap-2">
          Artikel Disukai
          {!isPending ? (
            <span className="rounded-full bg-[#f6e4da] px-2 py-0.5 text-xs font-semibold text-[#b8613f]">
              {totalItems}
            </span>
          ) : null}
        </span>
      }
      description="Kumpulan kisah wastra favorit Anda"
    >
      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 rounded-2xl bg-white p-3.5 ring-1 ring-[#efe8dd]"
            >
              <div className="size-20 rounded-xl bg-[#efe8db]" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-28 rounded-full bg-[#efe8db]" />
                <div className="h-4 w-3/4 rounded bg-[#f2ede4]" />
                <div className="h-3 w-full rounded bg-[#f6f2ea]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isPending && error ? (
        <ProfileEmptyState
          icon={XCircle}
          tone="error"
          title="Gagal memuat artikel"
          description="Gagal memuat artikel yang Anda sukai. Silakan coba lagi."
        />
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
    </ProfileSection>
  );
}
