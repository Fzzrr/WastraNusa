'use client';

import type { ProductFormModalProps } from '@/components/product-inventory/product-form-modal';
import {
  ProfileEmptyState,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatIDR } from '@/lib/utils';
import { type ProductInventoryItem } from '@/types/product';
import {
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AlertTriangle,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  type LucideIcon,
  Package,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 5;

type ProductPage = {
  items: ProductInventoryItem[];
  meta: { totalItems: number; totalPages: number; hasNextPage: boolean };
};

/**
 * Data hooks differ between the admin inventory and a seller's own shop; the
 * page itself is identical, so each side passes its hooks in.
 */
export type ProductInventoryPanelProps = {
  header: ReactNode;
  useProducts: (page: number, limit: number) => UseQueryResult<ProductPage>;
  useDeleteProduct: () => UseMutationResult<unknown, Error, string>;
  prefetchPage: (queryClient: QueryClient, page: number, limit: number) => void;
  FormModal: ComponentType<ProductFormModalProps>;
};

const STATUS_STYLES: Record<
  ProductInventoryItem['status'],
  { label: string; className: string; dot: string }
> = {
  active: {
    label: 'Aktif',
    className: 'bg-[#e3ece5] text-[#2f5f49]',
    dot: 'bg-[#3f8f63]',
  },
  inactive: {
    label: 'Nonaktif',
    className: 'bg-[#f1ede6] text-[#6f6a62]',
    dot: 'bg-[#a39c92]',
  },
  out_of_stock: {
    label: 'Habis',
    className: 'bg-[#f6e1dd] text-[#b04a3a]',
    dot: 'bg-[#b04a3a]',
  },
};

const cardClassName =
  'rounded-2xl bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6]';

function StatTile({
  icon: Icon,
  label,
  value,
  caption,
  tone,
  index,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone: 'green' | 'gold' | 'terracotta' | 'blue';
  index: number;
}) {
  const toneClassName = {
    green: 'bg-[#e3ece5] text-[#2f5f49]',
    gold: 'bg-[#f5ead3] text-[#a07a2c]',
    terracotta: 'bg-[#f6e4da] text-[#b8613f]',
    blue: 'bg-[#e6ecf3] text-[#34507a]',
  }[tone];

  return (
    <div
      className={cn(
        cardClassName,
        'group flex animate-in items-center gap-3 p-4 transition-all duration-300 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(60,41,15,0.05),0_18px_40px_rgba(89,69,38,0.12)]',
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105',
          toneClassName,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#9a8f80]">{label}</p>
        <p className="text-2xl leading-tight font-bold text-[#2f4f3f] tabular-nums">
          {value}
        </p>
        <p className="truncate text-[11px] text-[#b3aa9e]">{caption}</p>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-[#efe8dd]">
      <td className="px-4 py-3.5">
        <Skeleton className="size-4 rounded-sm bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-[#eee2d0]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 bg-[#eee2d0]" />
            <Skeleton className="h-3 w-28 bg-[#eee2d0]" />
          </div>
        </div>
      </td>
      {Array.from({ length: 5 }).map((_, index) => (
        <td key={index} className="px-4 py-3.5">
          <Skeleton className="mx-auto h-4 w-16 bg-[#eee2d0]" />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-1.5">
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
        </div>
      </td>
    </tr>
  );
}

export function ProductInventoryPanel({
  header,
  useProducts,
  useDeleteProduct,
  prefetchPage,
  FormModal,
}: ProductInventoryPanelProps) {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductInventoryItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: productData, isLoading } = useProducts(page, PAGE_SIZE);
  const {
    mutate: deleteProduct,
    mutateAsync: deleteProductAsync,
    isPending: isDeleting,
  } = useDeleteProduct();
  const queryClient = useQueryClient();

  const items = productData?.items ?? [];
  const totalItems = productData?.meta.totalItems ?? 0;
  const totalPages = productData?.meta.totalPages ?? 1;
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  // ponytail: status/stock tiles summarise the loaded page only; add a stats
  // endpoint if shops grow past one page and need exact totals.
  const activeCount = items.filter((item) => item.status === 'active').length;
  const lowStockCount = items.filter(
    (item) => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD,
  ).length;
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const pageScope = totalPages > 1 ? 'Di halaman ini' : 'Dari semua produk';

  useEffect(() => {
    if (productData?.meta.hasNextPage) {
      prefetchPage(queryClient, page + 1, PAGE_SIZE);
    }
  }, [page, productData, queryClient, prefetchPage]);

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteProduct(id, {
        onSuccess: () => {
          toast.success('Produk berhasil dihapus');
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Gagal menghapus produk',
          );
        },
      });
    }
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : items.map((product) => product.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} produk terpilih?`,
      )
    ) {
      return;
    }

    const results = await Promise.allSettled(
      selectedIds.map((id) => deleteProductAsync(id)),
    );
    const failedCount = results.filter(
      (result) => result.status === 'rejected',
    ).length;
    const succeededCount = results.length - failedCount;

    if (succeededCount > 0) {
      toast.success(`${succeededCount} produk berhasil dihapus`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} produk gagal dihapus`);
    }
    setSelectedIds([]);
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    setSelectedIds([]);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: ProductInventoryItem) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <main className="flex flex-col">
      {header}

      <section className="flex flex-1 flex-col gap-5 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatTile
            index={0}
            icon={Package}
            tone="green"
            label="Total Produk"
            value={isLoading ? '…' : totalItems.toLocaleString('id-ID')}
            caption="Semua produk terdaftar"
          />
          <StatTile
            index={1}
            icon={CheckCircle2}
            tone="blue"
            label="Aktif"
            value={isLoading ? '…' : activeCount.toLocaleString('id-ID')}
            caption={pageScope}
          />
          <StatTile
            index={2}
            icon={AlertTriangle}
            tone="terracotta"
            label="Stok Menipis"
            value={isLoading ? '…' : lowStockCount.toLocaleString('id-ID')}
            caption={`Stok 1–${LOW_STOCK_THRESHOLD} unit · ${pageScope.toLowerCase()}`}
          />
          <StatTile
            index={3}
            icon={Boxes}
            tone="gold"
            label="Total Stok"
            value={isLoading ? '…' : totalStock.toLocaleString('id-ID')}
            caption={pageScope}
          />
        </div>

        <div
          className={cn(
            cardClassName,
            'animate-in overflow-hidden duration-500 fill-mode-both fade-in slide-in-from-bottom-2',
          )}
          style={{ animationDelay: '280ms' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efe8dd] px-4 py-3 md:px-5">
            <span className="inline-flex items-center gap-2 text-sm text-[#6f6a62]">
              <span className="grid size-8 place-items-center rounded-lg bg-[#f5ead3] text-[#a07a2c]">
                <Package className="size-4" />
              </span>
              <span className="font-semibold text-[#2f4f3f] tabular-nums">
                {isLoading ? '…' : totalItems}
              </span>
              Produk
            </span>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="h-10 animate-in cursor-pointer gap-1.5 rounded-xl border-[#f0cfc7] bg-white px-4 text-[#b04a3a] fade-in zoom-in-95 hover:bg-[#f6e1dd] hover:text-[#9a3b2d]"
                >
                  <Trash2 className="size-4" />
                  Hapus ({selectedIds.length})
                </Button>
              ) : null}
              <Button
                onClick={handleAdd}
                className={cn(profilePrimaryButtonClassName, 'h-10 px-4')}
              >
                <Plus className="size-4" />
                Tambah Produk
              </Button>
            </div>
          </div>

          {!isLoading && items.length === 0 ? (
            <div className="p-5">
              <ProfileEmptyState
                icon={Package}
                title="Belum ada produk"
                description="Tambahkan produk pertama Anda agar tampil di katalog WastraNusa."
                action={
                  <Button
                    onClick={handleAdd}
                    className={cn(profilePrimaryButtonClassName, 'h-10 px-5')}
                  >
                    <Plus className="size-4" />
                    Tambah Produk
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-[#faf7f2] text-[10px] font-medium tracking-wider text-[#8a8378] uppercase">
                  <tr>
                    <th className="w-12 px-4 py-3.5">
                      <Checkbox
                        aria-label="Pilih semua produk"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        disabled={items.length === 0}
                      />
                    </th>
                    <th className="px-4 py-3.5">Produk</th>
                    <th className="px-4 py-3.5">Artikel</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Harga</th>
                    <th className="px-4 py-3.5 text-center">Stok</th>
                    <th className="px-4 py-3.5 text-center">Varian</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))
                    : items.map((product) => {
                        const isSelected = selectedIds.includes(product.id);
                        const status =
                          STATUS_STYLES[product.status] ??
                          STATUS_STYLES.inactive;
                        const isLowStock =
                          product.stock > 0 &&
                          product.stock <= LOW_STOCK_THRESHOLD;
                        return (
                          <tr
                            key={product.id}
                            onClick={() => handleEdit(product)}
                            className={cn(
                              'group cursor-pointer border-t border-[#efe8dd] transition-colors',
                              isSelected
                                ? 'bg-[#f4efe5]'
                                : 'hover:bg-[#faf7f2]',
                            )}
                          >
                            <td
                              className="px-4 py-3.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Checkbox
                                aria-label={`Pilih ${product.name}`}
                                checked={isSelected}
                                onChange={() => toggleSelectOne(product.id)}
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4efe5] text-[#b08a5e] ring-1 ring-[#ebe3d6]">
                                  {product.imageURL ? (
                                    <Image
                                      src={product.imageURL}
                                      alt=""
                                      fill
                                      sizes="48px"
                                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : (
                                    <Hexagon className="size-5" />
                                  )}
                                </span>
                                <div className="flex min-w-0 flex-col gap-0.5">
                                  <p className="line-clamp-1 font-semibold text-[#2f3a33] transition-colors group-hover:text-[#2f5543]">
                                    {product.name}
                                  </p>
                                  <p className="line-clamp-1 text-xs text-[#9a8f80]">
                                    {product.clothingType} · {product.island}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-[#6f6a62]">
                              <span className="inline-flex items-center gap-1.5">
                                <BookOpen className="size-3.5 shrink-0 text-[#b08a5e]" />
                                <span className="line-clamp-1">
                                  {product.articleTitle}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                                  status.className,
                                )}
                              >
                                <span
                                  className={cn(
                                    'size-1.5 rounded-full',
                                    status.dot,
                                  )}
                                />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right text-sm font-bold whitespace-nowrap text-[#2f5f49]">
                              {formatIDR(product.price)}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums',
                                  product.stock <= 0
                                    ? 'text-[#b04a3a]'
                                    : isLowStock
                                      ? 'text-[#a0702a]'
                                      : 'text-[#3d3a34]',
                                )}
                                title={isLowStock ? 'Stok menipis' : undefined}
                              >
                                <span
                                  className={cn(
                                    'size-1.5 rounded-full',
                                    product.stock <= 0
                                      ? 'bg-[#b04a3a]'
                                      : isLowStock
                                        ? 'animate-pulse bg-amber-500'
                                        : 'bg-[#3f8f63]',
                                  )}
                                />
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="rounded-full bg-[#f4efe5] px-2.5 py-1 text-xs font-semibold text-[#4d6356]">
                                {product.variantCount}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label="Edit produk"
                                  title="Edit produk"
                                  className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#f5ead3] hover:text-[#8a6a2a]"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label="Hapus produk"
                                  title="Hapus produk"
                                  className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-red-50 hover:text-red-600"
                                  onClick={() => handleDelete(product.id)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}

          {productData && totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-[#efe8dd] px-5 py-3.5">
              <p className="text-sm text-[#9a8f80]">
                Halaman{' '}
                <span className="font-semibold text-[#2f4f3f]">{page}</span>{' '}
                dari {totalPages}
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
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Halaman berikutnya"
                  className="size-8 cursor-pointer rounded-lg border-[#e5ded5] bg-[#fffdfa] text-[#6f6a62] hover:bg-[#f4efe5]"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <FormModal
        key={editingProduct?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
      />
    </main>
  );
}
