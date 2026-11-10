import { cn } from '@/lib/utils';
import type { ProductCatalogSortBy } from '@/types/product';

type CatalogProductToolbarProps = {
  activeSort: ProductCatalogSortBy;
  sortOptions: Array<{
    label: string;
    value: ProductCatalogSortBy;
  }>;
  productCount: number;
  onSortChange: (option: ProductCatalogSortBy) => void;
};

export function CatalogProductToolbar({
  activeSort,
  sortOptions,
  productCount,
  onSortChange,
}: CatalogProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[15px] text-ink-soft tabular-nums">
        {productCount} produk
      </p>

      <div
        role="group"
        aria-label="Urutkan produk"
        className="-mx-1 flex gap-1 overflow-x-auto px-1 sm:mx-0 sm:px-0"
      >
        {sortOptions.map((option) => {
          const isActive = activeSort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              className={cn(
                'h-10 shrink-0 cursor-pointer rounded-full px-4 text-[15px] whitespace-nowrap transition-colors active:scale-95',
                isActive
                  ? 'bg-brand font-semibold text-on-field'
                  : 'text-ink-soft hover:bg-surface hover:text-ink',
              )}
              onClick={() => onSortChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
