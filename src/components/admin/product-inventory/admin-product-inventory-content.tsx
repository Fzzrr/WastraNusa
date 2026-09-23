'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchProductInventories,
  productInventoryKeys,
  useDeleteProductInventory,
  useProductInventories,
} from '@/hooks/use-product-inventory';
import { formatIDR } from '@/lib/utils';
import { type ProductInventoryItem } from '@/types/product';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AddUpdateProductModal from './add-update-product-modal';

function TableRowSkeleton() {
  return (
    <tr className="border-t border-[#ece7de]">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40 bg-[#eee2d0]" />
          <Skeleton className="h-4 w-28 bg-[#eee2d0]" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-md bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-16 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-14 bg-[#eee2d0]" />
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

function getStatusBadgeClass(status: ProductInventoryItem['status']) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'inactive':
      return 'bg-muted text-foreground';
    case 'out_of_stock':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-muted text-foreground';
  }
}

function getStatusLabel(status: ProductInventoryItem['status']) {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Nonaktif';
    case 'out_of_stock':
      return 'Habis';
    default:
      return status;
  }
}

export function AdminProductInventoryContent() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductInventoryItem | null>(null);

  const { data: productData, isLoading } = useProductInventories(page, 10);
  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteProductInventory();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (productData?.meta.hasNextPage) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: productInventoryKeys.list(nextPage, 10),
        queryFn: () => fetchProductInventories(nextPage, 10),
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
      <AdminHeader
        title="Produk & Inventory"
        subtitle="Kelola Produk, Varian, dan Stok"
      />

      <section className="flex-1 bg-[#f0ede5] px-5 py-5 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl bg-[#ebe6db] p-4">
          <div className="flex items-center justify-end gap-3">
            <p className="text-sm text-muted-foreground">
              {isLoading ? '...' : productData?.meta.totalItems} produk
            </p>
            <Button onClick={handleAdd}>
              <Plus data-icon="inline-start" />
              Tambah Produk
            </Button>
          </div>

          <Card className="overflow-hidden rounded-2xl border border-[#ddd6c9] bg-background py-0 ring-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-[#ede8df] text-xs font-semibold tracking-wide text-[#6a645a] uppercase">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Artikel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Harga</th>
                    <th className="px-4 py-3 text-center">Stok</th>
                    <th className="px-4 py-3 text-center">Varian</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  ) : productData?.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-[#8f8377]"
                      >
                        Belum ada produk yang tersedia.
                      </td>
                    </tr>
                  ) : (
                    productData?.items.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-[#ece7de]"
                      >
                        <td className="px-4 py-3 text-[#2b2b2b]">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-base font-semibold">
                              {product.name}
                            </p>
                            <p className="line-clamp-1 text-xs text-muted-foreground/80">
                              {product.sku} · {product.clothingType} ·{' '}
                              {product.island}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6d6a64]">
                          {product.articleTitle}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={getStatusBadgeClass(product.status)}
                          >
                            {getStatusLabel(product.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-[#3d3a34]">
                          {formatIDR(product.price)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-[#3d3a34]">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-[#3d3a34]">
                          {product.variantCount}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              size="icon-sm"
                              variant="secondary"
                              aria-label="Edit produk"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              aria-label="Hapus produk"
                              onClick={() => handleDelete(product.id)}
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

          {productData && productData.meta.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {productData.meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg border-[#ddd6c9] bg-background text-[#6a645a] hover:bg-[#ede8df]"
                  onClick={() =>
                    setPage((currentPage) => Math.max(1, currentPage - 1))
                  }
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg border-[#ddd6c9] bg-background text-[#6a645a] hover:bg-[#ede8df]"
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.min(productData.meta.totalPages, currentPage + 1),
                    )
                  }
                  disabled={page === productData.meta.totalPages || isLoading}
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
