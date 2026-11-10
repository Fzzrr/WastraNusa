import { Button } from '@/components/ui/button';
import { cn, formatIDR } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import {
  Check,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Store,
} from 'lucide-react';
import Link from 'next/link';

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
  /** Omitted when there is no seller to ask (or the viewer is the seller). */
  onAskSeller?: () => void;
  isAskSellerPending?: boolean;
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
  onAskSeller,
  isAskSellerPending = false,
}: CatalogDetailProductSummaryProps) {
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const hasVariantOptions = variantOptions.length > 0;
  const isSelectedVariantOutOfStock =
    hasVariantOptions && selectedVariantStock <= 0;
  const isPurchaseDisabled = isOutOfStock || isSelectedVariantOutOfStock;

  const stockNote = isPurchaseDisabled
    ? 'Stok habis'
    : selectedVariantStock <= 5
      ? `Sisa ${selectedVariantStock}`
      : null;

  return (
    <div>
      <h1 className="text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" strokeWidth={1.75} />
          {product.province}
        </span>
        {product.seller ? (
          <Link
            href={`/shop/${product.seller.id}`}
            className="inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
          >
            <Store className="size-4" strokeWidth={1.75} />
            {product.seller.shopName ?? product.seller.name}
          </Link>
        ) : null}
        {product.seller && onAskSeller ? (
          <button
            type="button"
            onClick={onAskSeller}
            disabled={isAskSellerPending}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-surface px-4 font-semibold text-ink transition-colors hover:bg-brand hover:text-on-field disabled:opacity-60"
          >
            <MessageCircle className="size-4" strokeWidth={1.75} />
            {isAskSellerPending ? 'Membuka chat…' : 'Tanya penjual'}
          </button>
        ) : null}
      </div>

      <p
        key={selectedVariantPrice}
        className="mt-6 animate-in text-[clamp(1.75rem,2.6vw,2.25rem)] font-bold tracking-[-0.02em] text-ink tabular-nums duration-300 fade-in"
      >
        {formatIDR(selectedVariantPrice)}
      </p>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink">
        {product.description || 'Belum ada deskripsi.'}
      </p>

      {variantOptions.length > 0 ? (
        <div
          role="group"
          aria-label="Varian"
          className="mt-6 flex flex-wrap items-center gap-2"
        >
          {variantOptions.map((variant) => {
            const isSelected = selectedVariant === variant.name;
            return (
              <button
                key={variant.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${variant.name} (${variant.stock})`}
                className={cn(
                  'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[15px] transition-colors active:scale-95',
                  isSelected
                    ? 'bg-brand font-semibold text-on-field'
                    : 'bg-surface text-ink hover:bg-border',
                  variant.stock <= 0 &&
                    !isSelected &&
                    'line-through opacity-50',
                )}
                onClick={() => onVariantChange(variant.name)}
              >
                {isSelected ? <Check className="size-4" /> : null}
                {variant.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-4">
        <div className="inline-flex items-center rounded-full bg-surface p-1">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            className="grid size-10 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-card disabled:opacity-40"
            onClick={onDecreaseQuantity}
            disabled={safeQuantity <= 1 || isPurchaseDisabled}
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center text-base font-semibold text-ink tabular-nums">
            {safeQuantity}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            className="grid size-10 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-card disabled:opacity-40"
            onClick={onIncreaseQuantity}
            disabled={
              isPurchaseDisabled || safeQuantity >= selectedVariantStock
            }
          >
            <Plus className="size-4" />
          </button>
        </div>
        {stockNote ? (
          <span
            className={cn(
              'text-[15px]',
              isPurchaseDisabled ? 'text-destructive' : 'text-[#9a5b1e]',
            )}
          >
            {stockNote}
          </span>
        ) : null}
      </div>

      {/* On phones the actions stay pinned to the bottom while the summary is in view. */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-6 grid grid-cols-2 gap-2 bg-ground/95 px-4 py-3 sm:static sm:mx-0 sm:bg-transparent sm:p-0">
        <Button
          disabled={isPurchaseDisabled || isCartActionPending}
          aria-label={isCartActionPending ? undefined : 'Tambah ke keranjang'}
          className="h-12 cursor-pointer rounded-full bg-surface px-3 text-[15px] font-semibold text-ink transition-colors hover:bg-border active:scale-[0.98] sm:text-base"
          onClick={onAddToCart}
        >
          <ShoppingCart data-icon="inline-start" />
          {isCartActionPending ? 'Memproses…' : 'Keranjang'}
        </Button>
        <Button
          disabled={isPurchaseDisabled || isCartActionPending}
          className="h-12 cursor-pointer rounded-full bg-brand px-3 text-[15px] font-semibold text-on-field transition-colors hover:bg-brand-strong active:scale-[0.98] sm:text-base"
          onClick={onBuyNow}
        >
          {isCartActionPending ? 'Memproses…' : 'Beli langsung'}
        </Button>
      </div>
    </div>
  );
}
