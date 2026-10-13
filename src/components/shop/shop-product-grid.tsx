'use client';

import { CatalogProductCard } from '@/components/catalog/main/catalog-product-card';
import { cn } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import { PackageOpen } from 'lucide-react';

const surfaceCardClassName =
  'rounded-2xl border-0 bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6]';

export function ShopProductGrid({
  products,
  productCount,
}: {
  products: ProductInventoryItem[];
  productCount: number;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#2f4f3f]">Produk Toko</h2>
        <span className="rounded-full bg-[#f5ead3] px-3 py-1 text-xs font-semibold text-[#8a6a2a]">
          {productCount} produk
        </span>
      </div>

      {products.length === 0 ? (
        <div
          className={cn(
            surfaceCardClassName,
            'mt-4 flex flex-col items-center gap-3 px-6 py-14 text-center',
          )}
        >
          <span className="grid size-14 place-items-center rounded-full bg-[#f5ead3] text-[#b08a5e]">
            <PackageOpen className="size-7" />
          </span>
          <div>
            <p className="font-semibold text-[#3d4f45]">Belum ada produk</p>
            <p className="mt-1 text-sm text-[#9a8f80]">
              Toko ini belum menampilkan produk apa pun.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
