'use client';

import { CatalogProductCard } from '@/components/catalog/main/catalog-product-card';
import { CatalogProductGridSkeleton } from '@/components/catalog/main/catalog-product-grid';
import { CatalogProductToolbar } from '@/components/catalog/main/catalog-product-toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KawungPattern } from '@/components/wastra-hero';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import type { ProductCatalogSortBy } from '@/types/product';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const LANDING_PAGE_SIZE = 4;

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
    <section className="relative mt-2 overflow-hidden border-y border-[#dfd8ca] bg-gradient-to-b from-[#f8f5ee] to-[#f3efe5] py-10">
      <KawungPattern className="top-0 right-0 h-64 w-1/2 text-[#2f5b49] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <span className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-[#caa86a]/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <Badge
          variant="outline"
          className="inline-flex gap-1.5 rounded-lg border-[#e6d6b8] bg-[#f5ead3] px-3 py-1 text-xs font-semibold text-[#8a6a2a]"
        >
          <Sparkles className="size-3 text-[#caa86a]" />
          Produk Terbaru
        </Badge>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#2b4d3c] sm:text-3xl">
              Produk Pilihan Pengrajin{' '}
              <span className="bg-gradient-to-r from-[#2b4d3c] via-[#7a8f4e] to-[#caa86a] bg-clip-text text-transparent">
                Nusantara
              </span>
            </h2>
            <p className="mt-2 text-base text-[#5f7366]">
              Koleksi wastra autentik dari pengrajin terbaik Indonesia
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="group flex items-center gap-1 rounded-xl border border-[#2f4f3f] bg-[#f6f3eb] px-4 py-2 text-sm font-semibold text-[#2f4f3f] transition hover:-translate-y-0.5 hover:border-[#2f4f3f] hover:bg-[#2d5f48] hover:text-white hover:shadow-[0_10px_20px_-12px_rgba(45,95,72,0.8)] active:scale-95"
          >
            <Link href="/catalog">
              Lihat Semua
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="mt-7">
          <CatalogProductToolbar
            activeSort={activeSort}
            sortOptions={SORT_OPTIONS}
            productCount={data?.meta.totalItems ?? products.length}
            onSortChange={setActiveSort}
          />
        </div>

        {isPending && !data ? <CatalogProductGridSkeleton count={4} /> : null}

        {!isPending && error ? (
          <div className="mt-6 rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-6 text-sm text-[#8b5e4a]">
            Gagal memuat data produk. Silakan coba lagi.
          </div>
        ) : null}

        {!error && products.length > 0 ? (
          <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <CatalogProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : null}

        {!isPending && !error && products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] p-6 text-sm text-[#4f6658]">
            Belum ada produk yang tersedia untuk ditampilkan saat ini.
          </div>
        ) : null}
      </div>
    </section>
  );
}
