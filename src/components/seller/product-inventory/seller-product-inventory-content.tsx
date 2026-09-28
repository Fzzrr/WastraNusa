'use client';

import { ProductInventoryPanel } from '@/components/product-inventory/product-inventory-panel';
import { SellerHeader } from '@/components/seller/seller-header';
import {
  fetchSellerProducts,
  sellerProductKeys,
  useDeleteSellerProduct,
  useSellerProducts,
} from '@/hooks/use-seller-product';
import type { QueryClient } from '@tanstack/react-query';

import AddUpdateProductModal from './add-update-product-modal';

const prefetchPage = (queryClient: QueryClient, page: number, limit: number) =>
  void queryClient.prefetchQuery({
    queryKey: sellerProductKeys.list(page, limit),
    queryFn: () => fetchSellerProducts(page, limit),
  });

export function SellerProductInventoryContent() {
  return (
    <ProductInventoryPanel
      header={
        <SellerHeader
          title="Produk & Inventori"
          subtitle="Kelola Produk, Varian, dan Stok Toko Anda"
        />
      }
      useProducts={useSellerProducts}
      useDeleteProduct={useDeleteSellerProduct}
      prefetchPage={prefetchPage}
      FormModal={AddUpdateProductModal}
    />
  );
}
