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
                    <ArticleRowSkeleton key={i} />
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
