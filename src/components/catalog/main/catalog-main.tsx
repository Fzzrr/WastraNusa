'use client';

import { CatalogFiltersSidebar } from '@/components/catalog/main/catalog-filters-sidebar';
import type { PricePresetKey } from '@/components/catalog/main/catalog-filters-sidebar';
import { Gender, ProductStatus } from '@/generated/prisma/enums';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import type { ProductCatalogSortBy } from '@/types/product';
import { useMemo, useState } from 'react';

import { CatalogMainHeader } from './catalog-main-header';
import { CatalogPagination } from './catalog-pagination';
import {
  CatalogProductGrid,
  CatalogProductGridSkeleton,
} from './catalog-product-grid';
import { CatalogProductToolbar } from './catalog-product-toolbar';

const Catalog_PAGE_SIZE = 9;

const Catalog_SORT_OPTIONS: Array<{
  label: string;
  value: ProductCatalogSortBy;
}> = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Harga ↑', value: 'price_asc' },
  { label: 'Harga ↓', value: 'price_desc' },
  { label: 'Nama A-Z', value: 'name_asc' },
  { label: 'Nama Z-A', value: 'name_desc' },
];

const PRICE_PRESET_VALUES: Record<
  PricePresetKey,
  { min?: number; max?: number }
> = {
  all: {},
  'lt-200k': { max: 200000 },
  '200k-500k': { min: 200000, max: 500000 },
  '500k-1m': { min: 500000, max: 1000000 },
  '1m-3m': { min: 1000000, max: 3000000 },
  'gt-3m': { min: 3000000 },
};

function parsePriceInput(value: string): number | undefined {
  const rawValue = value.replace(/[^\d]/g, '');
  if (!rawValue) {
    return undefined;
  }

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export function CatalogMain() {
  const [activeSort, setActiveSort] = useState<ProductCatalogSortBy>(
    Catalog_SORT_OPTIONS[0].value,
  );
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedIsland, setSelectedIsland] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedGender, setSelectedGender] = useState<Gender>();
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedPricePreset, setSelectedPricePreset] =
    useState<PricePresetKey>('all');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filters = useMemo(
    () => ({
      minPrice: parsePriceInput(minPriceInput),
      maxPrice: parsePriceInput(maxPriceInput),
      island: selectedIsland,
      clothingType: selectedCategory,
      size: selectedSize,
      gender: selectedGender,
      status: selectedStatus,
      inStock: inStockOnly ? true : undefined,
      sortBy: activeSort,
    }),
    [
      activeSort,
      inStockOnly,
      maxPriceInput,
      minPriceInput,
      selectedCategory,
      selectedGender,
      selectedIsland,
      selectedSize,
      selectedStatus,
    ],
  );

  const { data, error, isPending } = useProductCatalog(
    currentPage,
    Catalog_PAGE_SIZE,
    filters,
  );
  const showLoadingSkeleton = isPending && !data;

  const products = data?.items ?? [];
  const meta = data?.meta;

  const handlePricePresetChange = (preset: PricePresetKey) => {
    setCurrentPage(1);
    setSelectedPricePreset(preset);
    setMinPriceInput(PRICE_PRESET_VALUES[preset].min?.toString() ?? '');
    setMaxPriceInput(PRICE_PRESET_VALUES[preset].max?.toString() ?? '');
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setActiveSort('newest');
    setSelectedCategory(undefined);
    setSelectedIsland(undefined);
    setSelectedSize(undefined);
    setSelectedGender(undefined);
    setSelectedStatus(undefined);
    setInStockOnly(false);
    setSelectedPricePreset('all');
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  return (
    <main className="border-t border-[#dbd4c7]">
      <CatalogMainHeader
        totalProducts={meta?.stats?.totalProducts ?? meta?.totalItems ?? 0}
        totalIslands={meta?.stats?.totalIslands ?? meta?.islands?.length ?? 0}
        images={products.map((product) => product.imageURL)}
      />

      <section className="border-y border-[#d4ccbe] bg-[#e8e3d9] py-6">
        <div className="mx-auto grid w-full max-w-[1320px] gap-4 px-4 md:px-6 lg:px-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <CatalogFiltersSidebar
            totalProducts={meta?.stats?.totalProducts ?? meta?.totalItems ?? 0}
            categories={meta?.categories ?? []}
            islands={meta?.islands ?? []}
            sizes={meta?.sizes ?? []}
            genders={meta?.genders ?? []}
            statuses={meta?.statuses ?? []}
            selectedCategory={selectedCategory}
            selectedIsland={selectedIsland}
            selectedSize={selectedSize}
            selectedGender={selectedGender}
            selectedStatus={selectedStatus}
            inStockOnly={inStockOnly}
            minPriceInput={minPriceInput}
            maxPriceInput={maxPriceInput}
            selectedPricePreset={selectedPricePreset}
            onCategoryChange={(value: string | undefined) => {
              setCurrentPage(1);
              setSelectedCategory(value);
            }}
            onIslandChange={(value: string | undefined) => {
              setCurrentPage(1);
              setSelectedIsland(value);
            }}
            onSizeChange={(value: string | undefined) => {
              setCurrentPage(1);
              setSelectedSize(value);
            }}
            onGenderChange={(value: string | undefined) => {
              setCurrentPage(1);
              setSelectedGender(value as Gender | undefined);
            }}
            onStatusChange={(value: string | undefined) => {
              setCurrentPage(1);
              setSelectedStatus(value as ProductStatus | undefined);
            }}
            onInStockOnlyChange={(value: boolean) => {
              setCurrentPage(1);
              setInStockOnly(value);
            }}
            onMinPriceChange={(value: string) => {
              setCurrentPage(1);
              setSelectedPricePreset('all');
              setMinPriceInput(value.replace(/[^\d]/g, ''));
            }}
            onMaxPriceChange={(value: string) => {
              setCurrentPage(1);
              setSelectedPricePreset('all');
              setMaxPriceInput(value.replace(/[^\d]/g, ''));
            }}
            onPricePresetChange={handlePricePresetChange}
            onResetFilters={resetFilters}
          />

          <div>
            <CatalogProductToolbar
              activeSort={activeSort}
              sortOptions={Catalog_SORT_OPTIONS}
              productCount={meta?.totalItems ?? products.length}
              onSortChange={(sortValue) => {
                setCurrentPage(1);
                setActiveSort(sortValue);
              }}
            />

            {showLoadingSkeleton ? <CatalogProductGridSkeleton /> : null}

            {!showLoadingSkeleton && !isPending && error ? (
              <div className="mt-4 rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-6 text-sm text-[#8b5e4a]">
                Gagal memuat data produk. Silakan coba lagi.
              </div>
            ) : null}

            {!error && products.length > 0 ? (
              <CatalogProductGrid products={products} />
            ) : null}

            {!isPending && !error && products.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] p-6 text-sm text-[#4f6658]">
                Belum ada produk yang sesuai dengan filter saat ini.
              </div>
            ) : null}

            {(meta?.totalPages ?? 0) > 1 ? (
              <CatalogPagination
                currentPage={currentPage}
                totalPages={meta?.totalPages ?? 1}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
