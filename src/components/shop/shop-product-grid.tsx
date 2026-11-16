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
  products,
}: {
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
      <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em] text-ink">
        Koleksi
      </h2>

      {products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 bg-surface px-6 py-14 text-center">
          <PackageOpen className="size-8 text-ink-soft" strokeWidth={1.5} />
          <p className="text-base text-ink-soft">Belum ada produk.</p>
        </div>
      ) : (
        <>
          {typeCounts.size > 1 ? (
            <div
              role="group"
              aria-label="Filter jenis wastra"
              className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
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
                      'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] transition-colors duration-200 active:scale-95',
                      isActive
                        ? 'bg-brand text-on-field'
                        : 'bg-surface text-ink hover:bg-brand hover:text-on-field',
                    )}
                  >
                    {filter.label}
                    <span
                      className={cn(
                        'text-[13px] font-normal tabular-nums',
                        isActive ? 'text-on-field-soft' : 'text-ink-soft',
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
            className="mt-6 grid animate-in grid-cols-2 gap-x-4 gap-y-8 duration-300 fade-in xl:grid-cols-4"
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
