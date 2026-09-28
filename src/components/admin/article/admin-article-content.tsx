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
    <tr className="border-t border-[#ece7de]">
      <td className="px-4 py-3">
        <Skeleton className="size-4 rounded-sm bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-[#eee2d0]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48 bg-[#eee2d0]" />
            <Skeleton className="h-4 w-32 bg-[#eee2d0]" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-full bg-[#eee2d0]" />
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
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
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
              <thead className="bg-[#faf7f2] text-[10px] font-medium tracking-wider text-[#8a8378] uppercase">
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
                      <div className="flex flex-col items-center gap-3 text-sm text-[#8f8377]">
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#f4efe5] text-[#b08a5e]">
                          <BookOpen className="size-5" />
                        </span>
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
                          'group cursor-pointer border-t border-[#efe8dd] transition-colors',
                          isSelected ? 'bg-[#f4efe5]' : 'hover:bg-[#faf7f2]',
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
                            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4efe5] text-[#b08a5e] ring-1 ring-[#ebe3d6]">
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
                              <p className="line-clamp-1 font-semibold text-[#2f3a33] transition-colors group-hover:text-[#2f5543]">
                                {article.title}
                              </p>
                              <p className="line-clamp-1 text-xs text-[#9a8f80]">
                                {article.motifLabel} · {article.region}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-[#f5ead3] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#8a6a2a]">
                            {article.topic}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6f6a62]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0 text-[#b08a5e]" />
                            <span className="line-clamp-1">
                              {article.region}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e7efe4] px-2.5 py-1 text-xs font-semibold text-[#2f5543] tabular-nums">
                            <Eye className="size-3.5" />
                            {article.views}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f1ede6] px-2.5 py-1 text-xs font-semibold text-[#6f6a62] tabular-nums">
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
                              className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#e7efe4] hover:text-[#2f5543]"
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
                              className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#f5ead3] hover:text-[#8a6a2a]"
                              onClick={() => handleEdit(article.slug)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label="Hapus artikel"
                              title="Hapus artikel"
                              className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-red-50 hover:text-red-600"
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
            <div className="flex items-center justify-between border-t border-[#efe8dd] px-5 py-4">
              <p className="text-sm text-[#9a8f80]">
                Halaman{' '}
                <span className="font-semibold text-[#2f4f3f]">{page}</span>{' '}
                dari {articlesData.meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Halaman sebelumnya"
                  className="size-8 cursor-pointer rounded-lg border-[#e5ded5] bg-[#fffdfa] text-[#6f6a62] hover:bg-[#f4efe5]"
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
                            <span className="px-1 text-[#9a8f80]">…</span>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              'size-8 cursor-pointer rounded-lg transition-all',
                              page === p
                                ? 'border-[#3a5a4a] bg-[#3a5a4a] text-white shadow-[0_4px_12px_rgba(47,75,61,0.25)] hover:bg-[#3a5a4a] hover:text-white'
                                : 'border-[#e5ded5] bg-[#fffdfa] text-[#6f6a62] hover:bg-[#f4efe5]',
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
                  className="size-8 cursor-pointer rounded-lg border-[#e5ded5] bg-[#fffdfa] text-[#6f6a62] hover:bg-[#f4efe5]"
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
