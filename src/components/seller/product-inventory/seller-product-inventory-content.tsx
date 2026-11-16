'use client';

import {
  ProfileEmptyState,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { SellerHeader } from '@/components/seller/seller-header';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  fetchSellerProducts,
  sellerProductKeys,
  useDeleteSellerProduct,
  useSellerProducts,
  useSetSellerProductStatus,
} from '@/hooks/use-seller-product';
import { cn } from '@/lib/utils';
import { type ProductInventoryItem } from '@/types/product';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  type LucideIcon,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AddUpdateProductModal from './add-update-product-modal';
import {
  LOW_STOCK_THRESHOLD,
  ProductRow,
  ProductRowSkeleton,
} from './product-table-row';

const PAGE_SIZE = 10;
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
    terracotta: 'bg-[#f6e4da] text-[#9c5235]',
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
        <p className="truncate text-xs text-[#b3aa9e]">{caption}</p>
      </div>
    </div>
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
  const { mutate: setProductStatus, isPending: isUpdatingStatus } =
    useSetSellerProductStatus();
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

  const handleToggleStatus = (product: ProductInventoryItem) => {
    const status = product.status === 'active' ? 'inactive' : 'active';
    setProductStatus(
      { idOrSlug: product.id, status },
      {
        onSuccess: () => {
          toast.success(
            status === 'active'
              ? 'Produk diaktifkan dan tampil di katalog'
              : 'Produk dinonaktifkan dan disembunyikan dari katalog',
          );
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Gagal mengubah status produk',
          );
        },
      },
    );
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
                <thead className="bg-[#faf7f2] text-xs font-medium tracking-wider text-[#8a8378] uppercase">
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
                        <ProductRowSkeleton key={index} />
                      ))
                    : items.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          isSelected={selectedIds.includes(product.id)}
                          isDeleting={isDeleting}
                          onToggleSelect={() => toggleSelectOne(product.id)}
                          isUpdatingStatus={isUpdatingStatus}
                          onEdit={() => handleEdit(product)}
                          onToggleStatus={() => handleToggleStatus(product)}
                          onDelete={() => handleDelete(product.id)}
                        />
                      ))}
                </tbody>
              </table>
            </div>
          )}

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            disabled={isLoading}
          />
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
