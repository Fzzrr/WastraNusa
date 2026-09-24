'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  articleKeys,
  fetchArticleDetail,
  fetchArticles,
  useArticles,
  useDeleteArticle,
} from '@/hooks/use-article';
import { type EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AddUpdateArticleModal from './add-update-article-modal';

function TableRowSkeleton() {
  return (
    <tr className="border-t border-[#ece7de]">
      <td className="px-4 py-3">
        <Skeleton className="size-4 rounded-sm bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48 bg-[#eee2d0]" />
          <Skeleton className="h-4 w-32 bg-[#eee2d0]" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-md bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-12 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-12 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-8 rounded-md bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-md bg-[#eee2d0]" />
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

  const { data: articlesData, isLoading } = useArticles(page, 10);
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
        queryKey: articleKeys.list(nextPage, 10),
        queryFn: () => fetchArticles(nextPage, 10),
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
        subtitle="Kelola Konten Edukasi Wastra Nusantara"
      />

      <section className="flex-1 bg-[#f0ede5] px-5 py-5 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl bg-[#ebe6db] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isLoading ? '...' : articlesData?.meta.totalItems} Artikel
            </p>
            <div className="flex items-center gap-3">
              {selectedSlugs.length > 0 ? (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  <Trash2 data-icon="inline-start" />
                  Hapus ({selectedSlugs.length})
                </Button>
              ) : null}
              <Button onClick={handleAdd}>
                <Plus data-icon="inline-start" />
                Tambah Artikel
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border border-[#ddd6c9] bg-background py-0 ring-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#ede8df] text-xs font-semibold tracking-wide text-[#6a645a] ">
                  <tr>
                    <th className="px-4 py-3">
                      <Checkbox
                        aria-label="Pilih semua artikel"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        disabled={articles.length === 0}
                      />
                    </th>
                    <th className="px-4 py-3 ">Judul Artikel</th>
                    <th className="px-4 py-3 ">Topik</th>
                    <th className="px-4 py-3">Wilayah</th>
                    <th className="px-4 py-3 text-center">Ditonton</th>
                    <th className="px-4 py-3 text-center">Baca (mnt)</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))
                  ) : articlesData?.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-[#8f8377]"
                      >
                        Belum ada artikel yang tersedia.
                      </td>
                    </tr>
                  ) : (
                    articlesData?.items.map((article) => (
                      <tr
                        key={article.slug}
                        onClick={() => handleEdit(article.slug)}
                        className="cursor-pointer border-t border-[#ece7de] hover:bg-[#f7f4ec]"
                      >
                        <td
                          className="px-4 py-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            aria-label={`Pilih ${article.title}`}
                            checked={selectedSlugs.includes(article.slug)}
                            onChange={() => toggleSelectOne(article.slug)}
                          />
                        </td>
                        <td className="px-4 py-3 text-[#2b2b2b]">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-base font-semibold">
                              {article.title}
                            </p>
                            <p className="text-xs text-muted-foreground/80 line-clamp-1">
                              {article.motifLabel} · {article.region}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="bg-[#edf0f5] text-[#5e6f92]"
                          >
                            {article.topic}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6d6a64]">
                          <div className="flex items-center gap-1.5 line-clamp-1">
                            <MapPin className="size-3.5" />
                            {article.region}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-[#3d3a34]">
                          {article.views}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-[#3d3a34]">
                          {article.readMinutes}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              size="icon-sm"
                              variant="secondary"
                              aria-label="Kunjungi artikel"
                              onClick={() =>
                                router.push(`/encyclopedia/${article.slug}`)
                              }
                            >
                              <Eye />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="secondary"
                              aria-label="Edit artikel"
                              onClick={() => handleEdit(article.slug)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              aria-label="Hapus artikel"
                              onClick={() => handleDelete(article.slug)}
                              disabled={isDeleting}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {articlesData && articlesData.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {articlesData.meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg border-[#ddd6c9] bg-background text-[#6a645a] hover:bg-[#ede8df]"
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
                            <span className="px-1 text-[#8f8377]">...</span>
                          )}
                          <Button
                            variant={page === p ? 'default' : 'outline'}
                            size="icon"
                            className={`size-8 rounded-lg ${
                              page === p
                                ? 'bg-[#3d3a34] text-white hover:bg-[#3d3a34]/90'
                                : 'border-[#ddd6c9] bg-background text-[#6a645a] hover:bg-[#ede8df]'
                            }`}
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
                  className="size-8 rounded-lg border-[#ddd6c9] bg-background text-[#6a645a] hover:bg-[#ede8df]"
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
