'use client';

import { CatalogProductCard } from '@/components/catalog/main/catalog-product-card';
import { CatalogProductGridSkeleton } from '@/components/catalog/main/catalog-product-grid';
import { CatalogProductToolbar } from '@/components/catalog/main/catalog-product-toolbar';
import { Reveal } from '@/components/reveal';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import type { ProductCatalogSortBy } from '@/types/product';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const LANDING_PAGE_SIZE = 4;
const GRID = 'mt-6 grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-4';

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

export function ProductCatalog() {
  const [activeSort, setActiveSort] = useState<ProductCatalogSortBy>('newest');
  const { data, error, isPending } = useProductCatalog(1, LANDING_PAGE_SIZE, {
    sortBy: activeSort,
  });

  const products = data?.items ?? [];

  return (
    <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em] text-ink">
          Karya pengrajin
        </h2>
        <Link
          href="/catalog"
          className="group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-brand transition-colors hover:bg-surface"
        >
          Semua produk
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-4">
        <CatalogProductToolbar
          activeSort={activeSort}
          sortOptions={SORT_OPTIONS}
          productCount={data?.meta.totalItems ?? products.length}
          onSortChange={setActiveSort}
        />
      </div>

      {isPending && !data ? (
        <CatalogProductGridSkeleton count={4} className={GRID} />
      ) : null}

      {!isPending && error ? (
        <p className="mt-6 bg-surface p-6 text-[15px] text-ink-soft">
          Gagal memuat produk. Coba muat ulang halaman.
        </p>
      ) : null}

      {!error && products.length > 0 ? (
        <Reveal className={GRID}>
          {products.map((product) => (
            <CatalogProductCard key={product.slug} product={product} />
          ))}
        </Reveal>
      ) : null}

      {!isPending && !error && products.length === 0 ? (
        <p className="mt-6 bg-surface p-6 text-[15px] text-ink-soft">
          Belum ada produk.
        </p>
      ) : null}
    </section>
  );
}
