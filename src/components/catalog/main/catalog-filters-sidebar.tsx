import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ProductFilterOption } from '@/types/product';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { FilterOptionList } from './catalog-filter-option-list';

const MAX_VISIBLE_CATEGORIES = 8;
const MAX_VISIBLE_ISLANDS = 8;

export type PricePresetKey =
  | 'all'
  | 'lt-200k'
  | '200k-500k'
  | '500k-1m'
  | '1m-3m'
  | 'gt-3m';

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
        className="flex h-12 w-full items-center gap-3 rounded-full border-0 bg-surface px-5 text-left text-ink transition-colors hover:bg-border active:scale-[0.99] xl:hidden"
        onClick={() => setIsFilterPanelOpen((value) => !value)}
        aria-expanded={isFilterPanelOpen}
      >
        <SlidersHorizontal className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2 text-[15px] font-semibold">
            Filter
            {activeFilterCount > 0 ? (
              <span className="text-[15px] font-normal text-ink-soft tabular-nums">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
        </span>
        <span className="text-ink-soft">
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
              title="Kategori Produk"
              allLabel="Semua Produk"
              allCount={totalProducts}
              options={categories}
              selected={selectedCategory}
              onChange={onCategoryChange}
              maxVisible={MAX_VISIBLE_CATEGORIES}
            />

            <Card className="gap-2 rounded-none border-0 bg-transparent p-0 py-2 text-ink">
              <h3 className="px-3 text-base font-semibold text-ink">
                Rentang Harga
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-2 text-[15px] text-ink-soft">
                  {PRICE_RANGES.map((item) => (
                    <label
                      key={item.key}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors',
                        selectedPricePreset === item.key
                          ? 'bg-surface font-semibold text-ink'
                          : 'hover:bg-surface',
                      )}
                    >
                      <input
                        type="radio"
                        name="price-range"
                        checked={selectedPricePreset === item.key}
                        onChange={() => onPricePresetChange(item.key)}
                        className="size-4 accent-brand"
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
                    className="h-9 rounded-xl border-border bg-card text-[15px] transition-shadow focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15"
                  />
                  <Input
                    value={maxPriceInput}
                    onChange={(event) => onMaxPriceChange(event.target.value)}
                    placeholder="Max"
                    className="h-9 rounded-xl border-border bg-card text-[15px] transition-shadow focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15"
                  />
                </div>
              </div>
            </Card>

            <FilterOptionList
              title="Asal Daerah"
              allLabel="Semua Pulau"
              allCount={sumCounts(islands)}
              options={islands}
              selected={selectedIsland}
              onChange={onIslandChange}
              maxVisible={MAX_VISIBLE_ISLANDS}
            />

            <FilterOptionList
              title="Gender"
              allLabel="Semua Gender"
              allCount={sumCounts(genders)}
              options={genders}
              selected={selectedGender}
              onChange={onGenderChange}
              formatLabel={formatGender}
            />

            <Card className="gap-2 rounded-none border-0 bg-transparent p-0 py-2 text-ink">
              <h3 className="px-3 text-base font-semibold text-ink">
                Ketersediaan
              </h3>
              <label
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[15px] transition-colors',
                  inStockOnly
                    ? 'bg-surface font-semibold text-ink'
                    : 'text-ink-soft hover:bg-surface',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-brand"
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
              className="group/reset h-10 cursor-pointer gap-2 rounded-full border-0 bg-transparent text-[15px] font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              onClick={onResetFilters}
            >
              <RotateCcw className="size-3.5 transition-transform duration-500 group-hover/reset:-rotate-180" />
              Reset filter
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
