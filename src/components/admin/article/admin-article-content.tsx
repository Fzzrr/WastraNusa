'use client';

import { AdminBrandChip, AdminHeader } from '@/components/admin/admin-header';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  articleKeys,
  fetchArticleDetail,
  fetchArticles,
  useArticles,
  useDeleteArticle,
} from '@/hooks/use-article';
import { type EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, FileText, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AddUpdateArticleModal from './add-update-article-modal';
import { ArticleRow, ArticleRowSkeleton } from './article-table-row';

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
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <AdminBrandChip />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffdfa] px-3 py-1 text-[#6f6a62] ring-1 ring-[#ebe3d6]">
              <BookOpen className="size-3.5 text-[#b08a5e]" />
              Kelola Konten Edukasi Wastra Nusantara
            </span>
          </div>
        }
        variant="plain"
      />

      <section className="flex flex-1 flex-col gap-5 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-[#fffdfa] px-4 py-2.5 text-sm text-[#6f6a62] ring-1 ring-[#ebe3d6]">
            <FileText className="size-4 text-[#b08a5e]" />
            <span className="font-semibold text-[#2f4f3f] tabular-nums">
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
                className="h-11 animate-in cursor-pointer rounded-xl border-red-200 bg-[#fffdfa] px-4 text-red-600 fade-in zoom-in-95 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 data-icon="inline-start" />
                Hapus ({selectedSlugs.length})
              </Button>
            ) : null}
            <Button
              onClick={handleAdd}
              className="h-11 cursor-pointer rounded-xl bg-[#3a5a4a] px-4 text-white shadow-[0_6px_16px_rgba(47,75,61,0.25)] transition-all hover:-translate-y-px hover:bg-[#2f4b3d]"
            >
              <Plus data-icon="inline-start" />
              Tambah Artikel
            </Button>
          </div>
        </div>

        <div className="animate-in overflow-hidden rounded-2xl bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6] duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#faf7f2] text-xs font-medium tracking-wider text-[#8a8378] uppercase">
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
                    <ArticleRowSkeleton key={i} />
                  ))
                ) : articlesData?.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14">
                      <div className="flex flex-col items-center gap-3 text-sm text-[#8f8377]">
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#f4efe5] text-[#b08a5e]">
                          <BookOpen className="size-5" />
                        </span>
                        Belum ada artikel yang tersedia.
                      </div>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <ArticleRow
                      key={article.slug}
                      article={article}
                      isSelected={selectedSlugs.includes(article.slug)}
                      isDeleting={isDeleting}
                      onToggleSelect={() => toggleSelectOne(article.slug)}
                      onEdit={() => handleEdit(article.slug)}
                      onDelete={() => handleDelete(article.slug)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={page}
            totalPages={articlesData?.meta.totalPages ?? 1}
            onPageChange={goToPage}
            disabled={isLoading}
          />
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
