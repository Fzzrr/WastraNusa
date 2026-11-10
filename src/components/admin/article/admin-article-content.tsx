'use client';

import { AdminBrandChip, AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  articleKeys,
  fetchArticleDetail,
  fetchArticles,
  useArticles,
  useDeleteArticle,
} from '@/hooks/use-article';
import { cn } from '@/lib/utils';
import { type EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AddUpdateArticleModal from './add-update-article-modal';

function TableRowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <Skeleton className="size-4 rounded-sm bg-surface" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-surface" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48 bg-surface" />
            <Skeleton className="h-4 w-32 bg-surface" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-full bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-12 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-12 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-8 rounded-lg bg-surface" />
          <Skeleton className="size-8 rounded-lg bg-surface" />
          <Skeleton className="size-8 rounded-lg bg-surface" />
        </div>
      </td>
    </tr>
  );
}

export function AdminArticleContent() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] =
    useState<EncyclopediaArticleDetail | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const { data: articlesData, isLoading } = useArticles(page, 10, {
    includeUnpublished: true,
  });
  const {
    mutate: deleteArticle,
    mutateAsync: deleteArticleAsync,
    isPending: isDeleting,
  } = useDeleteArticle();
  const queryClient = useQueryClient();
  const router = useRouter();

  const articles = articlesData?.items ?? [];
  const isAllSelected =
    articles.length > 0 && selectedSlugs.length === articles.length;

  useEffect(() => {
    if (articlesData?.meta.hasNextPage) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: articleKeys.list(
          nextPage,
          10,
          undefined,
          undefined,
          undefined,
          true,
        ),
        queryFn: () =>
          fetchArticles(nextPage, 10, { includeUnpublished: true }),
      });
    }
  }, [page, articlesData, queryClient]);

  const handleDelete = (slug: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      deleteArticle(slug);
    }
  };

  const handleEdit = async (slug: string) => {
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: articleKeys.detail(slug),
        queryFn: () => fetchArticleDetail(slug),
      });
      setEditingArticle(detail);
      setIsModalOpen(true);
    } catch {
      toast.error('Gagal mengambil detail artikel');
    }
  };

  const handleAdd = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    setSelectedSlugs([]);
  };

  const toggleSelectAll = () => {
    setSelectedSlugs(
      isAllSelected ? [] : articles.map((article) => article.slug),
    );
  };

  const toggleSelectOne = (slug: string) => {
    setSelectedSlugs((current) =>
      current.includes(slug)
        ? current.filter((selectedSlug) => selectedSlug !== slug)
        : [...current, slug],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedSlugs.length === 0) return;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedSlugs.length} artikel terpilih?`,
      )
    ) {
      return;
    }

    const results = await Promise.allSettled(
      selectedSlugs.map((slug) => deleteArticleAsync(slug)),
    );
    const failedCount = results.filter(
      (result) => result.status === 'rejected',
    ).length;
    const succeededCount = results.length - failedCount;

    if (succeededCount > 0) {
      toast.success(`${succeededCount} artikel berhasil dihapus`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} artikel gagal dihapus`);
    }
    setSelectedSlugs([]);
  };

  return (
    <main className="flex flex-col">
      <AdminHeader
        title="Manajemen Artikel"
        subtitle={
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[15px]">
            <AdminBrandChip />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-ink-soft ring-1 ring-border">
              <BookOpen className="size-3.5 text-ink-soft" />
              Kelola Konten Edukasi Wastra Nusantara
            </span>
          </div>
        }
        variant="plain"
      />

      <section className="flex flex-1 flex-col gap-5 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-[15px] text-ink-soft ring-1 ring-border">
            <FileText className="size-4 text-ink-soft" />
            <span className="font-semibold text-ink tabular-nums">
              {isLoading ? '…' : articlesData?.meta.totalItems}
            </span>
            Artikel
          </span>
          <div className="flex items-center gap-3">
            {selectedSlugs.length > 0 ? (
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="h-11 animate-in cursor-pointer rounded-full border-red-200 bg-card px-4 text-destructive fade-in zoom-in-95 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 data-icon="inline-start" />
                Hapus ({selectedSlugs.length})
              </Button>
            ) : null}
            <Button
              onClick={handleAdd}
              className="h-11 cursor-pointer rounded-full bg-brand px-4 text-on-field transition-all hover:bg-brand-strong"
            >
              <Plus data-icon="inline-start" />
              Tambah Artikel
            </Button>
          </div>
        </div>

        <div className="animate-in overflow-hidden rounded-xl bg-card ring-1 ring-border duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-surface text-[13px] font-medium text-ink-soft">
                <tr>
                  <th className="w-12 px-4 py-4">
                    <Checkbox
                      aria-label="Pilih semua artikel"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      disabled={articles.length === 0}
                    />
                  </th>
                  <th className="px-4 py-4">Judul Artikel</th>
                  <th className="px-4 py-4">Topik</th>
                  <th className="px-4 py-4">Wilayah</th>
                  <th className="px-4 py-4 text-center">Dilihat</th>
                  <th className="px-4 py-4 text-center">Waktu Baca (Mnt)</th>
                  <th className="px-4 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))
                ) : articlesData?.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14">
                      <div className="flex flex-col items-center gap-3 text-[15px] text-ink-soft">
                        <BookOpen
                          className="shrink-0 size-5 text-ink-soft"
                          strokeWidth={1.75}
                        />
                        Belum ada artikel yang tersedia.
                      </div>
                    </td>
                  </tr>
                ) : (
                  articlesData?.items.map((article) => {
                    const isSelected = selectedSlugs.includes(article.slug);
                    return (
                      <tr
                        key={article.slug}
                        onClick={() => handleEdit(article.slug)}
                        className={cn(
                          'group cursor-pointer border-t border-border transition-colors',
                          isSelected ? 'bg-surface' : 'hover:bg-surface',
                        )}
                      >
                        <td
                          className="px-4 py-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            aria-label={`Pilih ${article.title}`}
                            checked={isSelected}
                            onChange={() => toggleSelectOne(article.slug)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft ring-1 ring-border">
                              {article.imageURL ? (
                                <Image
                                  src={article.imageURL}
                                  alt=""
                                  fill
                                  sizes="48px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <BookOpen className="size-5" />
                              )}
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <p className="line-clamp-1 font-semibold text-ink transition-colors group-hover:text-ink">
                                {article.title}
                              </p>
                              <p className="line-clamp-1 text-[13px] text-ink-soft">
                                {article.motifLabel} · {article.region}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-surface px-2.5 py-1 text-[13px] font-medium whitespace-nowrap text-ink">
                            {article.topic}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[15px] text-ink-soft">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0 text-ink-soft" />
                            <span className="line-clamp-1">
                              {article.region}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink tabular-nums">
                            <Eye className="size-3.5" />
                            {article.views}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink-soft tabular-nums">
                            <Clock3 className="size-3.5" />
                            {article.readMinutes}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label="Kunjungi artikel"
                              title="Lihat artikel"
                              className="cursor-pointer rounded-full text-ink-soft hover:bg-surface hover:text-ink"
                              onClick={() =>
                                router.push(`/encyclopedia/${article.slug}`)
                              }
                            >
                              <Eye />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label="Edit artikel"
                              title="Edit artikel"
                              className="cursor-pointer rounded-full text-ink-soft hover:bg-surface hover:text-ink"
                              onClick={() => handleEdit(article.slug)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label="Hapus artikel"
                              title="Hapus artikel"
                              className="cursor-pointer rounded-full text-ink-soft hover:bg-red-50 hover:text-destructive"
                              onClick={() => handleDelete(article.slug)}
                              disabled={isDeleting}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {articlesData && articlesData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-4">
              <p className="text-base text-ink-soft">
                Halaman <span className="font-semibold text-ink">{page}</span>{' '}
                dari {articlesData.meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Halaman sebelumnya"
                  className="size-8 cursor-pointer rounded-full border-border bg-card text-ink-soft hover:bg-surface"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: articlesData.meta.totalPages },
                    (_, i) => i + 1,
                  )
                    .filter((p) => {
                      // Logic to show limited pages
                      if (articlesData.meta.totalPages <= 5) return true;
                      if (p === 1 || p === articlesData.meta.totalPages)
                        return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .map((p, i, arr) => {
                      const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                      return (
                        <div key={p} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-1 text-ink-soft">…</span>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              'size-8 cursor-pointer rounded-full transition-all',
                              page === p
                                ? 'border-brand bg-brand text-on-field hover:bg-brand-strong hover:text-white'
                                : 'border-border bg-card text-ink-soft hover:bg-surface',
                            )}
                            onClick={() => goToPage(p)}
                            disabled={isLoading}
                          >
                            {p}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Halaman berikutnya"
                  className="size-8 cursor-pointer rounded-full border-border bg-card text-ink-soft hover:bg-surface"
                  onClick={() =>
                    goToPage(Math.min(articlesData.meta.totalPages, page + 1))
                  }
                  disabled={page === articlesData.meta.totalPages || isLoading}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <AddUpdateArticleModal
        key={editingArticle?.slug ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingArticle}
      />
    </main>
  );
}
