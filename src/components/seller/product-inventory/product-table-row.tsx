import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Image from '@/components/ui/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatIDR } from '@/lib/utils';
import { type ProductInventoryItem } from '@/types/product';
import { BookOpen, Eye, EyeOff, Hexagon, Pencil, Trash2 } from 'lucide-react';

export const LOW_STOCK_THRESHOLD = 5;

const STATUS_STYLES: Record<
  ProductInventoryItem['status'],
  { label: string; className: string; dot: string }
> = {
  active: {
    label: 'Aktif',
    className: 'bg-[#e3ece5] text-[#2f5f49]',
    dot: 'bg-[#3f8f63]',
  },
  inactive: {
    label: 'Nonaktif',
    className: 'bg-[#f1ede6] text-[#6f6a62]',
    dot: 'bg-[#a39c92]',
  },
  out_of_stock: {
    label: 'Habis',
    className: 'bg-[#f6e1dd] text-[#b04a3a]',
    dot: 'bg-[#b04a3a]',
  },
};

export function ProductRowSkeleton() {
  return (
    <tr className="border-t border-[#efe8dd]">
      <td className="px-4 py-3.5">
        <Skeleton className="size-4 rounded-sm bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-[#eee2d0]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 bg-[#eee2d0]" />
            <Skeleton className="h-3 w-28 bg-[#eee2d0]" />
          </div>
        </div>
      </td>
      {Array.from({ length: 5 }).map((_, index) => (
        <td key={index} className="px-4 py-3.5">
          <Skeleton className="mx-auto h-4 w-16 bg-[#eee2d0]" />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-1.5">
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
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
  isUpdatingStatus,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  product: ProductInventoryItem;
  isSelected: boolean;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const isActive = product.status === 'active';
  const statusAction = isActive
    ? 'Nonaktifkan produk (sembunyikan dari katalog)'
    : 'Aktifkan produk';
  const status = STATUS_STYLES[product.status] ?? STATUS_STYLES.inactive;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <tr
      onClick={onEdit}
      className={cn(
        'group cursor-pointer border-t border-[#efe8dd] transition-colors',
        isSelected ? 'bg-[#f4efe5]' : 'hover:bg-[#faf7f2]',
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
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4efe5] text-[#b08a5e] ring-1 ring-[#ebe3d6]">
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
            <p className="line-clamp-1 font-semibold text-[#2f3a33] transition-colors group-hover:text-[#2f5543]">
              {product.name}
            </p>
            <p className="line-clamp-1 text-xs text-[#9a8f80]">
              {product.clothingType} · {product.island}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-[#6f6a62]">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="size-3.5 shrink-0 text-[#b08a5e]" />
          <span className="line-clamp-1">{product.articleTitle}</span>
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            status.className,
          )}
        >
          <span className={cn('size-1.5 rounded-full', status.dot)} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right text-sm font-bold whitespace-nowrap text-[#2f5f49]">
        {formatIDR(product.price)}
      </td>
      <td className="px-4 py-3.5 text-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums',
            product.stock <= 0
              ? 'text-[#b04a3a]'
              : isLowStock
                ? 'text-[#a0702a]'
                : 'text-[#3d3a34]',
          )}
          title={isLowStock ? 'Stok menipis' : undefined}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              product.stock <= 0
                ? 'bg-[#b04a3a]'
                : isLowStock
                  ? 'animate-pulse bg-amber-500'
                  : 'bg-[#3f8f63]',
            )}
          />
          {product.stock}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">
        <span className="rounded-full bg-[#f4efe5] px-2.5 py-1 text-xs font-semibold text-[#4d6356]">
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
            className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#f5ead3] hover:text-[#826428]"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={statusAction}
            title={statusAction}
            className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#e3ece5] hover:text-[#2f5f49]"
            onClick={onToggleStatus}
            disabled={isUpdatingStatus}
          >
            {isActive ? <EyeOff /> : <Eye />}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Hapus produk"
            title="Hapus produk"
            className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-red-50 hover:text-red-600"
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
