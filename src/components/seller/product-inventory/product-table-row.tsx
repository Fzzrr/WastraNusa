import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatIDR } from '@/lib/utils';
import { type ProductInventoryItem } from '@/types/product';
import { BookOpen, Hexagon, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

export const LOW_STOCK_THRESHOLD = 5;

const STATUS_STYLES: Record<
  ProductInventoryItem['status'],
  { label: string; className: string; dot: string }
> = {
  active: {
    label: 'Aktif',
    className: 'bg-surface text-ink',
    dot: 'bg-[#3f8f63]',
  },
  inactive: {
    label: 'Nonaktif',
    className: 'bg-surface text-ink-soft',
    dot: 'bg-surface',
  },
  out_of_stock: {
    label: 'Habis',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
};

export function ProductRowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3.5">
        <Skeleton className="size-4 rounded-sm bg-surface" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-surface" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 bg-surface" />
            <Skeleton className="h-3 w-28 bg-surface" />
          </div>
        </div>
      </td>
      {Array.from({ length: 5 }).map((_, index) => (
        <td key={index} className="px-4 py-3.5">
          <Skeleton className="mx-auto h-4 w-16 bg-surface" />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-1.5">
          <Skeleton className="size-8 rounded-lg bg-surface" />
          <Skeleton className="size-8 rounded-lg bg-surface" />
        </div>
      </td>
    </tr>
  );
}

export function ProductRow({
  product,
  isSelected,
  isDeleting,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  product: ProductInventoryItem;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_STYLES[product.status] ?? STATUS_STYLES.inactive;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <tr
      onClick={onEdit}
      className={cn(
        'group cursor-pointer border-t border-border transition-colors',
        isSelected ? 'bg-surface' : 'hover:bg-surface',
      )}
    >
      <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
        <Checkbox
          aria-label={`Pilih ${product.name}`}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft ring-1 ring-border">
            {product.imageURL ? (
              <Image
                src={product.imageURL}
                alt=""
                fill
                sizes="48px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <Hexagon className="size-5" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="line-clamp-1 font-semibold text-ink">
              {product.name}
            </p>
            <p className="line-clamp-1 text-[13px] text-ink-soft">
              {product.clothingType} · {product.island}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-[15px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="size-3.5 shrink-0 text-ink-soft" />
          <span className="line-clamp-1">{product.articleTitle}</span>
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold',
            status.className,
          )}
        >
          <span className={cn('size-1.5 rounded-full', status.dot)} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right text-[15px] font-bold whitespace-nowrap text-ink">
        {formatIDR(product.price)}
      </td>
      <td className="px-4 py-3.5 text-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[15px] font-semibold tabular-nums',
            product.stock <= 0
              ? 'text-destructive'
              : isLowStock
                ? 'text-ink-soft'
                : 'text-ink',
          )}
          title={isLowStock ? 'Stok menipis' : undefined}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              product.stock <= 0
                ? 'bg-destructive'
                : isLowStock
                  ? 'animate-pulse bg-amber-500'
                  : 'bg-[#3f8f63]',
            )}
          />
          {product.stock}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">
        <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink">
          {product.variantCount}
        </span>
      </td>
      <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Edit produk"
            title="Edit produk"
            className="cursor-pointer rounded-full text-ink-soft hover:bg-surface hover:text-ink"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Hapus produk"
            title="Hapus produk"
            className="cursor-pointer rounded-full text-ink-soft hover:bg-red-50 hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 />
          </Button>
        </div>
      </td>
    </tr>
  );
}
