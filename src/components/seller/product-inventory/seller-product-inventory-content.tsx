'use client';

import {
  ProfileEmptyState,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { SellerHeader } from '@/components/seller/seller-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchSellerProducts,
  sellerProductKeys,
  useDeleteSellerProduct,
  useSellerProducts,
} from '@/hooks/use-seller-product';
import { cn, formatIDR } from '@/lib/utils';
import { type ProductInventoryItem } from '@/types/product';
import { useQueryClient } from '@tanstack/react-query';
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AddUpdateProductModal from './add-update-product-modal';

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 5;

const STATUS_STYLES: Record<
  ProductInventoryItem['status'],
  { label: string; className: string; dot: string }
> = {
  active: {
    label: 'Aktif',
    className: 'bg-surface text-ink',
    dot: 'bg-[#3f8f63]',
  },
  inactive: {
    label: 'Nonaktif',
    className: 'bg-surface text-ink-soft',
    dot: 'bg-surface',
  },
  out_of_stock: {
    label: 'Habis',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
};

const cardClassName = 'rounded-xl bg-card ring-1 ring-border';

function StatTile({
  icon: Icon,
  label,
  value,
  caption,
  index,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  index: number;
}) {
  return (
    <div
      className={cn(
        cardClassName,
        'animate-in p-5 fill-mode-both fade-in slide-in-from-bottom-2',
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <p className="flex items-center gap-2 text-[15px] text-ink">
        <Icon className="size-5 shrink-0 text-ink-soft" strokeWidth={1.75} />
        {label}
      </p>
      <p className="mt-3 text-3xl leading-none font-semibold tracking-[-0.02em] text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-2 truncate text-[15px] text-ink-soft">{caption}</p>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3.5">
        <Skeleton className="size-4 rounded-sm bg-surface" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-surface" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 bg-surface" />
            <Skeleton className="h-3 w-28 bg-surface" />
          </div>
        </div>
      </td>
      {Array.from({ length: 5 }).map((_, index) => (
        <td key={index} className="px-4 py-3.5">
          <Skeleton className="mx-auto h-4 w-16 bg-surface" />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-1.5">
          <Skeleton className="size-8 rounded-lg bg-surface" />
          <Skeleton className="size-8 rounded-lg bg-surface" />
        </div>
      </td>
    </tr>
  );
}

export function SellerProductInventoryContent() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductInventoryItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: productData, isLoading } = useSellerProducts(page, PAGE_SIZE);
  const {
    mutate: deleteProduct,
    mutateAsync: deleteProductAsync,
    isPending: isDeleting,
  } = useDeleteSellerProduct();
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
      void queryClient.prefetchQuery({
        queryKey: sellerProductKeys.list(page + 1, PAGE_SIZE),
        queryFn: () => fetchSellerProducts(page + 1, PAGE_SIZE),
      });
    }
  }, [page, productData, queryClient]);

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
      <SellerHeader
        title="Produk & Inventori"
        subtitle="Kelola produk, varian, dan stok toko Anda"
      />

      <section className="flex flex-1 flex-col gap-5 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatTile
            index={0}
            icon={Package}
            label="Total Produk"
            value={isLoading ? '…' : totalItems.toLocaleString('id-ID')}
            caption="Semua produk terdaftar"
          />
          <StatTile
            index={1}
            icon={CheckCircle2}
            label="Aktif"
            value={isLoading ? '…' : activeCount.toLocaleString('id-ID')}
            caption={pageScope}
          />
          <StatTile
            index={2}
            icon={AlertTriangle}
            label="Stok Menipis"
            value={isLoading ? '…' : lowStockCount.toLocaleString('id-ID')}
            caption={`Stok 1–${LOW_STOCK_THRESHOLD} unit · ${pageScope.toLowerCase()}`}
          />
          <StatTile
            index={3}
            icon={Boxes}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <span className="inline-flex items-center gap-2 text-[15px] text-ink-soft">
              <Package
                className="shrink-0 size-5 text-ink-soft"
                strokeWidth={1.75}
              />
              <span className="font-semibold text-ink tabular-nums">
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
                  className="h-10 animate-in cursor-pointer gap-1.5 rounded-full border-destructive/30 bg-card px-4 text-destructive fade-in zoom-in-95 hover:bg-destructive/10 hover:text-destructive"
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
                <thead className="bg-surface text-[13px] font-medium text-ink-soft">
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
                              'group cursor-pointer border-t border-border transition-colors',
                              isSelected ? 'bg-surface' : 'hover:bg-surface',
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
                                <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft ring-1 ring-border">
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
                                  <p className="line-clamp-1 font-semibold text-ink transition-colors group-hover:text-ink">
                                    {product.name}
                                  </p>
                                  <p className="line-clamp-1 text-[13px] text-ink-soft">
                                    {product.clothingType} · {product.island}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-[15px] text-ink-soft">
                              <span className="inline-flex items-center gap-1.5">
                                <BookOpen className="size-3.5 shrink-0 text-ink-soft" />
                                <span className="line-clamp-1">
                                  {product.articleTitle}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold',
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
                            <td className="px-4 py-3.5 text-right text-[15px] font-bold whitespace-nowrap text-ink">
                              {formatIDR(product.price)}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 text-[15px] font-semibold tabular-nums',
                                  product.stock <= 0
                                    ? 'text-destructive'
                                    : isLowStock
                                      ? 'text-ink-soft'
                                      : 'text-ink',
                                )}
                                title={isLowStock ? 'Stok menipis' : undefined}
                              >
                                <span
                                  className={cn(
                                    'size-1.5 rounded-full',
                                    product.stock <= 0
                                      ? 'bg-destructive'
                                      : isLowStock
                                        ? 'animate-pulse bg-amber-500'
                                        : 'bg-[#3f8f63]',
                                  )}
                                />
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink">
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
                                  className="cursor-pointer rounded-full text-ink-soft hover:bg-surface hover:text-ink"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label="Hapus produk"
                                  title="Hapus produk"
                                  className="cursor-pointer rounded-full text-ink-soft hover:bg-red-50 hover:text-destructive"
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
            <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
              <p className="text-base text-ink-soft">
                Halaman <span className="font-semibold text-ink">{page}</span>{' '}
                dari {totalPages}
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
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Halaman berikutnya"
                  className="size-8 cursor-pointer rounded-full border-border bg-card text-ink-soft hover:bg-surface"
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

      <AddUpdateProductModal
        key={editingProduct?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
      />
    </main>
  );
}
