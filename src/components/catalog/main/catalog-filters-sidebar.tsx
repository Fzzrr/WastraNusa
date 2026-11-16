import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ProductFilterOption } from '@/types/product';
import {
  ChevronDown,
  MapPin,
  PackageCheck,
  RotateCcw,
  SlidersHorizontal,
  Tags,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

import {
  FilterCardTitle,
  FilterOptionList,
  filterCardClassName,
} from './catalog-filter-option-list';

const MAX_VISIBLE_CATEGORIES = 8;
const MAX_VISIBLE_ISLANDS = 8;

export type PricePresetKey =
  'all' | 'lt-200k' | '200k-500k' | '500k-1m' | '1m-3m' | 'gt-3m';

const PRICE_RANGES: Array<{
  key: PricePresetKey;
  label: string;
}> = [
  { key: 'all', label: 'Semua Harga' },
  { key: 'lt-200k', label: '< Rp 200.000' },
  { key: '200k-500k', label: 'Rp 200.000 - 500.000' },
  { key: '500k-1m', label: 'Rp 500.000 - 1.000.000' },
  { key: '1m-3m', label: 'Rp 1.000.000 - 3.000.000' },
  { key: 'gt-3m', label: '> Rp 3.000.000' },
];

const GENDER_LABELS: Record<string, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
  unisex: 'Unisex',
};

function capitalizeFirstLetter(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

const sumCounts = (options: ProductFilterOption[]) =>
  options.reduce((total, option) => total + option.count, 0);

const formatGender = (name: string) =>
  GENDER_LABELS[name.toLowerCase()] ?? capitalizeFirstLetter(name);

type CatalogFiltersSidebarProps = {
  totalProducts: number;
  categories: ProductFilterOption[];
  islands: ProductFilterOption[];
  sizes: ProductFilterOption[];
  genders: ProductFilterOption[];
  selectedCategory?: string;
  selectedIsland?: string;
  selectedSize?: string;
  selectedGender?: string;
  inStockOnly: boolean;
  minPriceInput: string;
  maxPriceInput: string;
  selectedPricePreset: PricePresetKey;
  onCategoryChange: (value?: string) => void;
  onIslandChange: (value?: string) => void;
  onSizeChange: (value?: string) => void;
  onGenderChange: (value?: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onPricePresetChange: (value: PricePresetKey) => void;
  onResetFilters: () => void;
};

export function CatalogFiltersSidebar({
  totalProducts,
  categories,
  islands,
  genders,
  selectedCategory,
  selectedIsland,
  selectedSize,
  selectedGender,
  inStockOnly,
  minPriceInput,
  maxPriceInput,
  selectedPricePreset,
  onCategoryChange,
  onIslandChange,
  onGenderChange,
  onInStockOnlyChange,
  onMinPriceChange,
  onMaxPriceChange,
  onPricePresetChange,
  onResetFilters,
}: CatalogFiltersSidebarProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const hasPriceFilter =
    selectedPricePreset !== 'all' ||
    minPriceInput.length > 0 ||
    maxPriceInput.length > 0;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedIsland ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedGender ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (hasPriceFilter ? 1 : 0);

  return (
    <aside>
      {/* Mobile-only toggle: keeps the (long) filter stack collapsed by default
          on small screens so the product grid isn't pushed below the fold.
          Hidden from xl up where the sidebar sits alongside the grid. */}
      <Button
        variant="outline"
        className="group flex h-auto w-full items-center gap-3 rounded-2xl border-[#dad1c3] bg-[#f6f2e9] p-2.5 pr-3 text-left shadow-sm transition-all duration-200 hover:border-[#bfae8e] hover:bg-[#f1ebdf] hover:shadow active:scale-[0.99] xl:hidden"
        onClick={() => setIsFilterPanelOpen((value) => !value)}
        aria-expanded={isFilterPanelOpen}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#357456] to-[#234b38] text-[#edf4ec] shadow-sm ring-1 ring-[#234b38]/20 transition-transform duration-200 group-hover:scale-105">
          <SlidersHorizontal className="size-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2 text-sm font-bold text-[#3f5b4c]">
            Filter Produk
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#caa86a] px-1.5 text-xs font-semibold text-[#3c2e14]">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
          <span className="text-xs font-medium text-[#667060]">
            {activeFilterCount > 0
              ? `${activeFilterCount} filter aktif`
              : 'Kategori, harga, ukuran, dll'}
          </span>
        </span>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#ece5d8] text-[#5d6f62] transition-colors duration-200 group-hover:bg-[#e2dac9]">
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-300',
              isFilterPanelOpen && 'rotate-180',
            )}
          />
        </span>
      </Button>

      {/* Collapsible on mobile (smooth height + fade), always open from xl up. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out xl:!grid-rows-[1fr] xl:!opacity-100',
          isFilterPanelOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 pt-3 xl:pt-0">
            <FilterOptionList
              icon={Tags}
              title="Kategori Produk"
              allLabel="Semua Produk"
              allCount={totalProducts}
              options={categories}
              selected={selectedCategory}
              onChange={onCategoryChange}
              maxVisible={MAX_VISIBLE_CATEGORIES}
            />

            <Card className={filterCardClassName}>
              <FilterCardTitle icon={Wallet}>Rentang Harga</FilterCardTitle>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-2 text-sm text-[#52685b]">
                  {PRICE_RANGES.map((item) => (
                    <label
                      key={item.key}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors',
                        selectedPricePreset === item.key
                          ? 'bg-[#e3ece5] font-semibold text-[#2f5f49]'
                          : 'hover:bg-[#f4efe5]',
                      )}
                    >
                      <input
                        type="radio"
                        name="price-range"
                        checked={selectedPricePreset === item.key}
                        onChange={() => onPricePresetChange(item.key)}
                        className="size-4 accent-[#2f5f49]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={minPriceInput}
                    onChange={(event) => onMinPriceChange(event.target.value)}
                    placeholder="Min"
                    className="h-9 rounded-xl border-[#e5ded5] bg-white text-xs transition-shadow focus-visible:border-[#2f5f49] focus-visible:ring-3 focus-visible:ring-[#2f5f49]/15"
                  />
                  <Input
                    value={maxPriceInput}
                    onChange={(event) => onMaxPriceChange(event.target.value)}
                    placeholder="Max"
                    className="h-9 rounded-xl border-[#e5ded5] bg-white text-xs transition-shadow focus-visible:border-[#2f5f49] focus-visible:ring-3 focus-visible:ring-[#2f5f49]/15"
                  />
                </div>
              </div>
            </Card>

            <FilterOptionList
              icon={MapPin}
              title="Asal Daerah"
              allLabel="Semua Pulau"
              allCount={sumCounts(islands)}
              options={islands}
              selected={selectedIsland}
              onChange={onIslandChange}
              maxVisible={MAX_VISIBLE_ISLANDS}
            />

            <FilterOptionList
              icon={Users}
              title="Gender"
              allLabel="Semua Gender"
              allCount={sumCounts(genders)}
              options={genders}
              selected={selectedGender}
              onChange={onGenderChange}
              formatLabel={formatGender}
            />

            <Card className={filterCardClassName}>
              <FilterCardTitle icon={PackageCheck}>
                Ketersediaan
              </FilterCardTitle>
              <label
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                  inStockOnly
                    ? 'bg-[#e3ece5] font-semibold text-[#2f5f49]'
                    : 'text-[#52685b] hover:bg-[#f4efe5]',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-[#2f5f49]"
                  checked={inStockOnly}
                  onChange={(event) =>
                    onInStockOnlyChange(event.target.checked)
                  }
                />
                Hanya tampilkan produk yang tersedia
              </label>
            </Card>

            <Button
              variant="outline"
              className="group/reset h-9 cursor-pointer gap-2 rounded-xl border-[#e3d9c7] bg-[#fbf8f2] text-xs font-bold text-[#4f6558] transition-all hover:border-[#2f5f49]/40 hover:bg-[#e3ece5] hover:text-[#2f5f49]"
              onClick={onResetFilters}
            >
              <RotateCcw className="size-3.5 transition-transform duration-500 group-hover/reset:-rotate-180" />
              Reset Semua Filter
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
