'use client';

import { cn } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import { ImageOff, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { formatVariantPriceRange } from '../utils';

/** Stock is only worth a word when it is about to run out. */
const LOW_STOCK = 5;

type CatalogProductCardProps = {
  product: ProductInventoryItem;
};

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const status = isOutOfStock
    ? 'Habis'
    : product.status === 'inactive'
      ? 'Nonaktif'
      : null;

  return (
    <Link
      href={`/catalog/${product.slug}`}
      className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-ground"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {product.imageURL ? (
          <Image
            src={product.imageURL}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
            className={cn(
              'object-cover transition-transform duration-700 ease-out group-hover:scale-105',
              isOutOfStock && 'grayscale-[60%]',
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-soft">
            <ImageOff className="size-6" strokeWidth={1.5} />
          </div>
        )}

        {status ? (
          <span className="absolute top-0 left-0 bg-ink px-2.5 py-1 text-[13px] font-semibold text-on-field">
            {status}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink decoration-1 underline-offset-4 group-hover:underline">
          {product.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-ink-soft">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{product.province}</span>
        </p>

        <div className="mt-auto pt-2">
          <p className="text-[15px] font-bold tracking-tight text-ink tabular-nums sm:text-base">
            {formatVariantPriceRange(product.variants, product.price)}
          </p>
          {!isOutOfStock && product.stock <= LOW_STOCK ? (
            <p className="mt-0.5 text-[13px] text-ink-soft">
              Sisa {product.stock}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
