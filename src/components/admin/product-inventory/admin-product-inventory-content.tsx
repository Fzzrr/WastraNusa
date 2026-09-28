'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { ProductInventoryPanel } from '@/components/product-inventory/product-inventory-panel';
import {
  fetchProductInventories,
  productInventoryKeys,
  useDeleteProductInventory,
  useProductInventories,
} from '@/hooks/use-product-inventory';
import type { QueryClient } from '@tanstack/react-query';

import AddUpdateProductModal from './add-update-product-modal';

const prefetchPage = (queryClient: QueryClient, page: number, limit: number) =>
  void queryClient.prefetchQuery({
    queryKey: productInventoryKeys.list(page, limit),
    queryFn: () => fetchProductInventories(page, limit),
  });

export function AdminProductInventoryContent() {
  return (
    <ProductInventoryPanel
      header={
        <AdminHeader
          title="Produk & Inventori"
          subtitle="Kelola Produk, Varian, dan Stok"
          variant="plain"
        />
      }
      useProducts={useProductInventories}
      useDeleteProduct={useDeleteProductInventory}
      prefetchPage={prefetchPage}
      FormModal={AddUpdateProductModal}
    />
  );
}
