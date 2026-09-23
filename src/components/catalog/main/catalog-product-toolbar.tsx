import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProductCatalogSortBy } from '@/types/product';
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpAZ,
  ArrowUpDown,
  Clock,
  History,
  Package,
} from 'lucide-react';

const SORT_ICONS: Record<ProductCatalogSortBy, typeof Clock> = {
  newest: Clock,
  oldest: History,
  price_asc: ArrowUp,
  price_desc: ArrowDown,
  name_asc: ArrowDownAZ,
  name_desc: ArrowUpAZ,
};

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
    <Card className="rounded-2xl border border-[#d9d0c1] bg-[#f9f6ef] px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Result count */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#e2dac9] bg-[#efeadf] py-1.5 pr-4 pl-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2f5f49] text-[#edf3eb]">
            <Package className="size-4" />
          </span>
          <p className="text-sm text-[#5b6f63]">
            Menampilkan{' '}
            <span className="rounded-md bg-[#2f5f49]/10 px-1.5 py-0.5 font-bold text-[#2f5b49]">
              {productCount}
            </span>{' '}
            Produk
          </p>
        </div>

        {/* Sort control */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#7d8a7f]">
            <ArrowUpDown className="size-3.5" />
            Urutkan
          </span>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#e2dac9] bg-[#efeadf] p-1">
            {sortOptions.map((option) => {
              const Icon = SORT_ICONS[option.value];
              const isActive = activeSort === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'h-7 gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-200 active:scale-95',
                    isActive
                      ? 'bg-[#2f5f49] text-[#edf3eb] shadow-sm hover:bg-[#2f5f49]/90 hover:text-[#edf3eb]'
                      : 'text-[#5d6f62] hover:bg-[#e3dccd] hover:text-[#3f5b4c]',
                  )}
                  onClick={() => onSortChange(option.value)}
                >
                  <Icon className="size-3.5" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
