import { Skeleton } from '@/components/ui/skeleton';
import type { ProductInventoryItem } from '@/types/product';

import { CatalogProductCard } from './catalog-product-card';

const gridClassName = 'mt-6 grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-3';

type CatalogProductGridProps = {
  products: ProductInventoryItem[];
};

export function CatalogProductGrid({ products }: CatalogProductGridProps) {
  return (
    <div className={gridClassName}>
      {products.map((product) => (
        <CatalogProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

type CatalogProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function CatalogProductGridSkeleton({
  count = 9,
  className = gridClassName,
}: CatalogProductGridSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`catalog-skeleton-${index}`}>
          <Skeleton className="aspect-[4/5] w-full rounded-none bg-surface" />
          <Skeleton className="mt-3 h-5 w-4/5 rounded-none bg-surface" />
          <Skeleton className="mt-2 h-4 w-1/2 rounded-none bg-surface" />
          <Skeleton className="mt-3 h-5 w-1/3 rounded-none bg-surface" />
        </div>
      ))}
    </div>
  );
}
