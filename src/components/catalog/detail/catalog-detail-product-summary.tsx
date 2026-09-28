import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatIDR } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import {
  Check,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Tag,
  Zap,
} from 'lucide-react';

type CatalogDetailProductSummaryProps = {
  product: ProductInventoryItem;
  variantOptions: ProductInventoryItem['variants'];
  selectedVariant?: string;
  selectedVariantPrice: number;
  selectedVariantStock: number;
  safeQuantity: number;
  onVariantChange: (variant?: string) => void;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isCartActionPending?: boolean;
};

export function CatalogDetailProductSummary({
  product,
  variantOptions,
  selectedVariant,
  selectedVariantPrice,
  selectedVariantStock,
  safeQuantity,
  onVariantChange,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onAddToCart,
  onBuyNow,
  isCartActionPending = false,
}: CatalogDetailProductSummaryProps) {
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const hasVariantOptions = variantOptions.length > 0;
  const isSelectedVariantOutOfStock =
    hasVariantOptions && selectedVariantStock <= 0;
  const isPurchaseDisabled = isOutOfStock || isSelectedVariantOutOfStock;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className="gap-1 rounded-full border-[#e6d6b8] bg-[#f5ead3] px-2.5 py-1 text-[#8a6a2a]"
        >
          <Tag className="size-3" />
          {product.clothingType}
        </Badge>
        <Badge
          variant="outline"
          className="gap-1 rounded-full border-[#efd5c6] bg-[#f6e4da] px-2.5 py-1 text-[#b8613f]"
        >
          <MapPin className="size-3" />
          {product.province}
        </Badge>
      </div>

      <h1 className="mt-3 text-5xl font-bold tracking-tight text-[#2f5b49]">
        {product.name}
      </h1>

      <Card className="relative mt-4 gap-1 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#e3ece5] via-[#f1ebdf] to-[#f5ead3] px-5 py-4 ring-1 ring-[#d9d0c2]">
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#2f5f49] to-[#caa86a]" />
        <span className="text-xs font-semibold tracking-wider text-[#6e7a70] uppercase">
          Harga{selectedVariant ? ` · ${selectedVariant}` : ''}
        </span>
        <h2
          key={selectedVariantPrice}
          className="animate-in text-4xl font-extrabold tracking-tight text-[#2f5f49] duration-300 fade-in"
        >
          {formatIDR(selectedVariantPrice)}
        </h2>
      </Card>

      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#3e5348]">
        {product.description ||
          'Deskripsi produk belum tersedia. Silakan cek artikel ensiklopedia untuk konteks budaya produk ini.'}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#4d6458]">Varian</span>
        <div className="flex flex-wrap items-center gap-2">
          {variantOptions.length > 0 ? (
            variantOptions.map((variant) => {
              const isSelected = selectedVariant === variant.name;
              return (
                <Button
                  key={variant.id}
                  type="button"
                  variant="outline"
                  aria-pressed={isSelected}
                  aria-label={`${variant.name} (${variant.stock})`}
                  className={cn(
                    'h-10 cursor-pointer gap-1.5 rounded-xl border-[#ddd4c5] bg-[#fbf8f2] px-3.5 text-[#496356] transition-all hover:-translate-y-px hover:border-[#2f5f49]/50 hover:bg-[#fbf8f2] hover:text-[#2f5f49]',
                    isSelected &&
                      'border-[#2f5f49] bg-[#2f5f49] text-[#edf4ec] shadow-[0_6px_14px_-6px_rgba(47,95,73,0.6)] hover:bg-[#2f5f49] hover:text-[#edf4ec]',
                    variant.stock <= 0 && !isSelected && 'opacity-50',
                  )}
                  onClick={() => onVariantChange(variant.name)}
                >
                  {isSelected ? <Check className="size-3.5" /> : null}
                  {variant.name}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[11px] font-semibold',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#efe8dd] text-[#7b857e]',
                    )}
                  >
                    {variant.stock}
                  </span>
                </Button>
              );
            })
          ) : (
            <span className="text-sm text-[#6f6a5f]">Belum ada varian</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Card className="inline-flex flex-row items-center gap-1 rounded-xl border-0 bg-[#fbf8f2] p-1 ring-1 ring-[#ddd4c5]">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Kurangi jumlah"
            className="cursor-pointer rounded-lg text-[#2f5f49] hover:bg-[#e3ece5]"
            onClick={onDecreaseQuantity}
            disabled={safeQuantity <= 1 || isPurchaseDisabled}
          >
            <Minus />
          </Button>
          <span className="min-w-8 text-center text-base font-bold text-[#315642] tabular-nums">
            {safeQuantity}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Tambah jumlah"
            className="cursor-pointer rounded-lg text-[#2f5f49] hover:bg-[#e3ece5]"
            onClick={onIncreaseQuantity}
            disabled={
              isPurchaseDisabled || safeQuantity >= selectedVariantStock
            }
          >
            <Plus />
          </Button>
        </Card>
        <span className="inline-flex items-center gap-2 text-sm text-[#6c6962]">
          <span
            className={cn(
              'size-2 rounded-full',
              selectedVariantStock <= 0
                ? 'bg-red-500'
                : selectedVariantStock <= 5
                  ? 'animate-pulse bg-amber-500'
                  : 'bg-[#3f8f63]',
            )}
          />
          <span>Stok tersedia: {selectedVariantStock} unit</span>
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          disabled={isPurchaseDisabled || isCartActionPending}
          className="h-12 cursor-pointer rounded-xl bg-[#2f5f49] text-[#edf4ec] shadow-[0_10px_20px_-10px_rgba(47,95,73,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#254a39] active:translate-y-0"
          onClick={onAddToCart}
        >
          <ShoppingCart data-icon="inline-start" />
          {isCartActionPending ? 'Memproses...' : 'Tambah ke Keranjang'}
        </Button>
        <Button
          disabled={isPurchaseDisabled || isCartActionPending}
          className="h-12 cursor-pointer rounded-xl bg-gradient-to-r from-[#cc7543] to-[#d98b52] text-white shadow-[0_10px_20px_-10px_rgba(204,117,67,0.8)] transition-all hover:-translate-y-0.5 hover:from-[#b56539] hover:to-[#c97a45] active:translate-y-0"
          onClick={onBuyNow}
        >
          <Zap data-icon="inline-start" />
          {isCartActionPending ? 'Memproses...' : 'Beli Langsung'}
        </Button>
      </div>
    </div>
  );
}
