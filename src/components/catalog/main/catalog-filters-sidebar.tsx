import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ProductFilterOption } from '@/types/product';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

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

function capitalizeFirstLetter(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

type CatalogFiltersSidebarProps = {
  totalProducts: number;
  categories: ProductFilterOption[];
  islands: ProductFilterOption[];
  sizes: ProductFilterOption[];
  genders: ProductFilterOption[];
  statuses: ProductFilterOption[];
  selectedCategory?: string;
  selectedIsland?: string;
  selectedSize?: string;
  selectedGender?: string;
  selectedStatus?: string;
  inStockOnly: boolean;
  minPriceInput: string;
  maxPriceInput: string;
  selectedPricePreset: PricePresetKey;
  onCategoryChange: (value?: string) => void;
  onIslandChange: (value?: string) => void;
  onSizeChange: (value?: string) => void;
  onGenderChange: (value?: string) => void;
  onStatusChange: (value?: string) => void;
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
  selectedStatus,
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

  // Tambahkan di sekitar baris 111:
  const [openSections, setOpenSections] = useState({
    category: false,
    price: false,
    island: false,
    gender: false,
    stock: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasPriceFilter =
    selectedPricePreset !== 'all' ||
    minPriceInput.length > 0 ||
    maxPriceInput.length > 0;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedIsland ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedGender ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
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
          <span className="text-xs font-medium text-[#86917f]">
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
            <Card className="gap-3 rounded-2xl border border-[#dad1c3] bg-[#f6f2e9] p-3 text-[#3f5b4c]">
              <button
                type="button"
                onClick={() => toggleSection('category')}
                className="flex w-full items-center justify-between text-left text-sm font-bold"
              >
                <span>Kategori Produk</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openSections.category && 'rotate-180',
                  )}
                />
              </button>
              {openSections.category && (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                      !selectedCategory
                        ? 'bg-[#2f5f49] text-[#edf4ec]'
                        : 'text-[#4f6659] hover:bg-[#ece5d8]',
                    )}
                    onClick={() => onCategoryChange(undefined)}
                  >
                    <span>Semua Produk</span>
                    <Badge
                      variant="secondary"
                      className="rounded-none border-0 bg-transparent p-0 text-current shadow-none"
                    >
                      {totalProducts}
                    </Badge>
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                        selectedCategory === category.name
                          ? 'bg-[#2f5f49] text-[#edf4ec]'
                          : 'text-[#4f6659] hover:bg-[#ece5d8]',
                      )}
                      onClick={() => onCategoryChange(category.name)}
                    >
                      <span>{category.name}</span>
                      <Badge
                        variant="secondary"
                        className="rounded-none border-0 bg-transparent p-0 text-current shadow-none"
                      >
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="gap-3 rounded-2xl border border-[#dad1c3] bg-[#f6f2e9] p-3 text-[#3f5b4c]">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="flex w-full items-center justify-between text-left text-sm font-bold"
              >
                <span>Rentang Harga</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openSections.price && 'rotate-180',
                  )}
                />
              </button>
              {openSections.price && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-2 text-sm text-[#52685b]">
                    {PRICE_RANGES.map((item) => (
                      <label
                        key={item.key}
                        className="inline-flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          name="price-range"
                          checked={selectedPricePreset === item.key}
                          onChange={() => onPricePresetChange(item.key)}
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
                      className="h-8 rounded-md border-[#ddd5c6] bg-[#ece6db] text-xs"
                    />
                    <Input
                      value={maxPriceInput}
                      onChange={(event) => onMaxPriceChange(event.target.value)}
                      placeholder="Max"
                      className="h-8 rounded-md border-[#ddd5c6] bg-[#ece6db] text-xs"
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card className="gap-3 rounded-2xl border border-[#dad1c3] bg-[#f6f2e9] p-3 text-[#3f5b4c]">
              <button
                type="button"
                onClick={() => toggleSection('island')}
                className="flex w-full items-center justify-between text-left text-sm font-bold"
              >
                <span>Asal Daerah</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openSections.island && 'rotate-180',
                  )}
                />
              </button>
              {openSections.island && (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                      !selectedIsland
                        ? 'bg-[#2f5f49] text-[#edf4ec]'
                        : 'text-[#4f6659] hover:bg-[#ece5d8]',
                    )}
                    onClick={() => onIslandChange(undefined)}
                  >
                    <span>Semua Pulau</span>
                    <Badge
                      variant="secondary"
                      className="rounded-none border-0 bg-transparent p-0 text-current shadow-none"
                    >
                      {islands.reduce(
                        (total, island) => total + island.count,
                        0,
                      )}
                    </Badge>
                  </button>

                  {islands.map((island) => (
                    <button
                      key={island.name}
                      type="button"
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                        selectedIsland === island.name
                          ? 'bg-[#2f5f49] text-[#edf4ec]'
                          : 'text-[#4f6659] hover:bg-[#ece5d8]',
                      )}
                      onClick={() => onIslandChange(island.name)}
                    >
                      <span>{island.name}</span>
                      <Badge
                        variant="secondary"
                        className="rounded-none border-0 bg-transparent p-0 text-current shadow-none"
                      >
                        {island.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="gap-3 rounded-2xl border border-[#dad1c3] bg-[#f6f2e9] p-3 text-[#3f5b4c]">
              <button
                type="button"
                onClick={() => toggleSection('gender')}
                className="flex w-full items-center justify-between text-left text-sm font-bold"
              >
                <span>Gender</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openSections.gender && 'rotate-180',
                  )}
                />
              </button>
              {openSections.gender && (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                      !selectedGender
                        ? 'bg-[#2f5f49] text-[#edf4ec]'
                        : 'text-[#4f6659] hover:bg-[#ece5d8]',
                    )}
                    onClick={() => onGenderChange(undefined)}
                  >
                    <span>Semua Gender</span>
                    <Badge
                      variant="secondary"
                      className="rounded-none border-0 bg-transparent p-0 text-current shadow-none"
                    >
                      {genders.reduce(
                        (total, gender) => total + gender.count,
                        0,
                      )}
                    </Badge>
                  </button>

                  {genders.map((gender) => (
                    <button
                      key={gender.name}
                      type="button"
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                        selectedGender === gender.name
                          ? 'bg-[#2f5f49] text-[#edf4ec]'
                          : 'text-[#4f6659] hover:bg-[#ece5d8]',
                      )}
                      onClick={() => onGenderChange(gender.name)}
                    >
                      <span>{capitalizeFirstLetter(gender.name)}</span>
                      <Badge
                        variant="secondary"
                        className="rounded-none border-0 bg-transparent p-0 text-current shadow-none"
                      >
                        {gender.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="gap-3 rounded-2xl border border-[#dad1c3] bg-[#f6f2e9] p-3 text-[#3f5b4c]">
              <button
                type="button"
                onClick={() => toggleSection('stock')}
                className="flex w-full items-center justify-between text-left text-sm font-bold"
              >
                <span>Ketersediaan</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openSections.stock && 'rotate-180',
                  )}
                />
              </button>
              {openSections.stock && (
                <label className="inline-flex items-center gap-2 text-sm text-[#52685b]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) =>
                      onInStockOnlyChange(event.target.checked)
                    }
                  />
                  Hanya tampilkan produk yang tersedia
                </label>
              )}
            </Card>

            <Button
              variant="outline"
              className="h-8 rounded-xl border-[#dad2c4] bg-[#f7f3ea] text-xs text-[#4f6558] transition-all duration-200 hover:border-[#c0b39a] hover:bg-[#ece5d8] active:scale-[0.99]"
              onClick={onResetFilters}
            >
              Reset Semua Filter
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
