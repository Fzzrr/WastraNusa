'use client';

import { CatalogProductCard } from '@/components/catalog/main/catalog-product-card';
import { CatalogProductToolbar } from '@/components/catalog/main/catalog-product-toolbar';
import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';
import type {
  ProductCatalogSortBy,
  ProductInventoryItem,
} from '@/types/product';
import { PackageOpen } from 'lucide-react';
import { useState } from 'react';

const surfaceCardClassName =
  'rounded-2xl border-0 bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6]';

const SORT_OPTIONS: Array<{
  label: string;
  value: ProductCatalogSortBy;
}> = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Harga ↑', value: 'price_asc' },
  { label: 'Harga ↓', value: 'price_desc' },
  { label: 'Nama A-Z', value: 'name_asc' },
];

const COMPARE: Record<
  ProductCatalogSortBy,
  (a: ProductInventoryItem, b: ProductInventoryItem) => number
> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  name_asc: (a, b) => a.name.localeCompare(b.name, 'id'),
  name_desc: (a, b) => b.name.localeCompare(a.name, 'id'),
};

export function ShopProductGrid({
  shopName,
  products,
}: {
  shopName: string;
  products: ProductInventoryItem[];
}) {
  const [activeSort, setActiveSort] = useState<ProductCatalogSortBy>('newest');
  const [activeType, setActiveType] = useState<string | null>(null);

  const typeCounts = new Map<string, number>();
  for (const product of products) {
    typeCounts.set(
      product.clothingType,
      (typeCounts.get(product.clothingType) ?? 0) + 1,
    );
  }
  const filters = [
    { value: null, label: 'Semua', count: products.length },
    ...[...typeCounts].map(([value, count]) => ({
      value,
      label: value,
      count,
    })),
  ];

  const visible = products
    .filter((p) => activeType === null || p.clothingType === activeType)
    .sort(COMPARE[activeSort]);

  return (
    <section>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#2b4d3c] sm:text-3xl">
          Koleksi Toko
        </h2>
        <p className="mt-2 text-base text-[#5f7366]">
          Wastra pilihan dari {shopName}
        </p>
      </div>

      {products.length === 0 ? (
        <div
          className={cn(
            surfaceCardClassName,
            'mt-5 flex flex-col items-center gap-3 px-6 py-14 text-center',
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
        <>
          {typeCounts.size > 1 ? (
            <div
              role="group"
              aria-label="Filter jenis wastra"
              className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
            >
              {filters.map((filter) => {
                const isActive = activeType === filter.value;
                return (
                  <button
                    key={filter.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveType(filter.value)}
                    className={cn(
                      'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 active:scale-95',
                      isActive
                        ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-[#edf3eb] shadow-[0_6px_14px_-8px_rgba(47,95,73,0.8)]'
                        : 'bg-[#fbf8f2] text-[#5d6f62] ring-1 ring-[#e3d9c7] hover:-translate-y-0.5 hover:bg-[#f5ead3] hover:text-[#3f5b4c]',
                    )}
                  >
                    {filter.label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-xs tabular-nums',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#efeadf] text-[#826428]',
                      )}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-4">
            <CatalogProductToolbar
              activeSort={activeSort}
              sortOptions={SORT_OPTIONS}
              productCount={visible.length}
              onSortChange={setActiveSort}
            />
          </div>

          {/* Re-keyed so the cards fade back in after a filter or sort change. */}
          <Reveal
            key={`${activeType ?? 'all'}-${activeSort}`}
            className="mt-4 grid animate-in auto-rows-fr grid-cols-1 gap-3 duration-300 fade-in sm:grid-cols-2 xl:grid-cols-3"
          >
            {visible.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </Reveal>
        </>
      )}
    </section>
  );
}
