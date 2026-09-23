import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatIDR } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

type CatalogDetailProductSummaryProps = {
  product: ProductInventoryItem;
  sizeOptions: ProductInventoryItem['variants'];
  colorOptions: ProductInventoryItem['variants'];
  selectedColor?: string;
  selectedSize?: string;
  selectedVariantPrice: number;
  selectedVariantStock: number;
  safeQuantity: number;
  onColorChange: (color?: string) => void;
  onSizeChange: (size?: string) => void;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isCartActionPending?: boolean;
};

export function CatalogDetailProductSummary({
  product,
  sizeOptions,
  colorOptions,
  selectedColor,
  selectedSize,
  selectedVariantPrice,
  selectedVariantStock,
  safeQuantity,
  onColorChange,
  onSizeChange,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onAddToCart,
  onBuyNow,
  isCartActionPending = false,
}: CatalogDetailProductSummaryProps) {
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const hasVariantOptions = sizeOptions.length > 0 || colorOptions.length > 0;
  const isSelectedVariantOutOfStock =
    hasVariantOptions && selectedVariantStock <= 0;
  const isPurchaseDisabled = isOutOfStock || isSelectedVariantOutOfStock;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className="border-[#e0d8ca] bg-[#f4ecdd] text-[#baa489]"
        >
          {product.clothingType}
        </Badge>
        <Badge
          variant="outline"
          className="border-[#e0d8ca] bg-[#f4ecdd] text-[#bc7c5f]"
        >
          {product.province}
        </Badge>
      </div>

      <h1 className="mt-2 text-5xl font-bold tracking-tight text-[#2f5b49]">
        {product.name}
      </h1>

      <Card className="mt-4 rounded-2xl border border-[#ddd4c5] bg-[#efe9de] px-5 py-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#2f5f49]">
          {formatIDR(selectedVariantPrice)}
        </h2>
      </Card>

      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#3e5348]">
        {product.description ||
          'Deskripsi produk belum tersedia. Silakan cek artikel ensiklopedia untuk konteks budaya produk ini.'}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#4d6458]">
            Pilihan Warna:
          </span>
          {colorOptions.length > 0 ? (
            colorOptions.map((color) => (
              <Button
                key={color.id}
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  'rounded-full border-[#ddd3c2] bg-[#f4efe5] text-[#4f6558]',
                  selectedColor === color.name && 'bg-[#dfe8dd] text-[#315642]',
                )}
                onClick={() => onColorChange(color.name)}
              >
                {color.name} ({color.stock})
              </Button>
            ))
          ) : (
            <span className="text-sm text-[#6f6a5f]">
              Belum ada varian warna
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#4d6458]">Ukuran</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sizeOptions.length > 0 ? (
            sizeOptions.map((size) => (
              <Button
                key={size.id}
                type="button"
                variant="outline"
                className={cn(
                  'rounded-lg border-[#ddd4c5] bg-[#f5f0e7] text-[#496356]',
                  selectedSize === size.name &&
                    'border-[#2f5f49] bg-[#2f5f49] text-[#edf4ec]',
                )}
                onClick={() => onSizeChange(size.name)}
              >
                {size.name} ({size.stock})
              </Button>
            ))
          ) : (
            <span className="text-sm text-[#6f6a5f]">
              Belum ada varian ukuran
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Card className="inline-flex flex-row items-center gap-0 rounded-xl border border-[#ddd4c5] bg-[#f4efe5] p-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-md"
            onClick={onDecreaseQuantity}
            disabled={safeQuantity <= 1 || isPurchaseDisabled}
          >
            <Minus />
          </Button>
          <span className="min-w-8 text-center text-sm font-semibold text-[#315642]">
            {safeQuantity}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-md"
            onClick={onIncreaseQuantity}
            disabled={
              isPurchaseDisabled || safeQuantity >= selectedVariantStock
            }
          >
            <Plus />
          </Button>
        </Card>
        <span className="text-sm text-[#6c6962]">
          Stok tersedia: {selectedVariantStock} unit
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          disabled={isPurchaseDisabled || isCartActionPending}
          className="h-11 rounded-xl bg-[#2f5f49] text-[#edf4ec] hover:bg-[#254a39]"
          onClick={onAddToCart}
        >
          <ShoppingCart data-icon="inline-start" />
          {isCartActionPending ? 'Memproses...' : 'Tambah ke Keranjang'}
        </Button>
        <Button
          disabled={isPurchaseDisabled || isCartActionPending}
          className="h-11 rounded-xl bg-[#cc7543] text-white hover:bg-[#b56539]"
          onClick={onBuyNow}
        >
          {isCartActionPending ? 'Memproses...' : 'Beli Langsung'}
        </Button>
      </div>
    </div>
  );
}
