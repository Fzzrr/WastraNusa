'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { formatVariantPriceRange } from '../utils';

const chipClassName =
  'inline-flex h-5 shrink-0 items-center rounded-full border border-[#e3d9c7] bg-white px-2 text-[10px] whitespace-nowrap text-[#5f7467]';
const CHIP_GAP = 4;

/**
 * Variant chips on a single line: shows as many as fit the card width and
 * collapses the rest into a "+n" chip (full list in its tooltip).
 */
function VariantChips({ labels }: { labels: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(labels.length);
  const labelsKey = labels.join('|');

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    // Runs on observe (initial layout) and whenever the card is resized.
    const observer = new ResizeObserver(() => {
      const chips = Array.from(measure.children) as HTMLElement[];
      const plusChip = chips.pop();
      const plusWidth = plusChip?.offsetWidth ?? 0;
      const available = container.clientWidth;

      let used = 0;
      let count = 0;
      for (const [index, chip] of chips.entries()) {
        const width = used + (count > 0 ? CHIP_GAP : 0) + chip.offsetWidth;
        const hasMore = index < chips.length - 1;
        const reserve = hasMore ? CHIP_GAP + plusWidth : 0;
        if (width + reserve > available) break;
        used = width;
        count += 1;
      }
      setVisibleCount(count);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [labelsKey]);

  const hidden = labels.slice(visibleCount);

  return (
    <div ref={containerRef} className="relative flex min-w-0 gap-1">
      {/* Invisible copy used only to measure each chip's natural width. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 flex gap-1"
      >
        {labels.map((label) => (
          <span key={label} className={chipClassName}>
            {label}
          </span>
        ))}
        <span className={chipClassName}>+{labels.length}</span>
      </div>

      {labels.slice(0, visibleCount).map((label) => (
        <span key={label} className={chipClassName}>
          {label}
        </span>
      ))}
      {hidden.length > 0 ? (
        <span
          title={hidden.join(', ')}
          className={cn(
            chipClassName,
            'border-[#e6d6b8] bg-[#f5ead3] font-semibold text-[#8a6a2a]',
          )}
        >
          +{hidden.length}
        </span>
      ) : null}
    </div>
  );
}

type CatalogProductCardProps = {
  product: ProductInventoryItem;
};

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const sizeVariants = product.variants
    .filter((variant) => variant.type === 'size')
    .map((variant) => variant.name);
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';

  return (
    <Link href={`/catalog/${product.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-[#fbf8f2] p-0 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_-18px_rgba(89,69,38,0.35)] ring-1 ring-[#e3d9c7] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_24px_40px_-22px_rgba(47,91,73,0.5)] group-hover:ring-[#caa86a]/50">
        <div className="relative h-56 overflow-hidden bg-[#ece2d4]">
          <Badge
            variant="outline"
            className="absolute top-3 left-3 z-10 rounded-full border-white/40 bg-white/75 px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6a2a] shadow-sm backdrop-blur-md"
          >
            {product.clothingType}
          </Badge>

          {isOutOfStock ? (
            <Badge
              className={cn(
                'absolute top-10 left-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                'bg-[#b04a3a]/90 text-white shadow-sm backdrop-blur-md',
              )}
            >
              Habis
            </Badge>
          ) : product.status === 'inactive' ? (
            <Badge className="absolute top-10 left-3 z-10 rounded-full bg-[#8b8479]/90 px-2.5 py-0.5 text-[11px] font-bold text-[#fbfbfb] backdrop-blur-md">
              Nonaktif
            </Badge>
          ) : null}

          {product.imageURL ? (
            <Image
              src={product.imageURL}
              alt={product.name}
              fill
              className={cn(
                'object-cover transition-transform duration-700 ease-out group-hover:scale-110',
                isOutOfStock && 'grayscale-[60%]',
              )}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-2 text-[#7c6c54]">
                <span className="size-4 rotate-45 border border-[#cebda2]" />
                <span className="text-sm font-medium">Belum ada gambar</span>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute top-3 right-3 z-10 grid size-8 translate-y-1 place-items-center rounded-full border border-white/30 bg-black/30 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] transition-transform duration-500 group-hover:scale-x-100" />
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="flex items-center justify-between text-xs text-[#7c7a72]">
            <span>{product.clothingType}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-[#b08a5e]" />
              {product.province}
            </span>
          </div>

          <h3 className="line-clamp-2 text-base leading-tight font-bold text-[#365847] transition-colors group-hover:text-[#244a39]">
            {product.name}
          </h3>

          <VariantChips
            labels={
              sizeVariants.length > 0 ? sizeVariants : ['Tanpa Varian Ukuran']
            }
          />

          <div className="@container mt-auto flex items-center justify-between gap-2 border-t border-[#efe8dd] pt-2.5">
            <div className="flex min-w-0 flex-col">
              {/* Scales with the card width so a price range stays on one line. */}
              <p className="text-[clamp(0.75rem,5.4cqw,1rem)] font-extrabold tracking-tight whitespace-nowrap text-[#2f5f49]">
                {formatVariantPriceRange(product.variants, product.price)}
              </p>
            </div>
            <p
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap',
                isOutOfStock ? 'text-[#b04a3a]' : 'text-[#4d6858]',
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  isOutOfStock
                    ? 'bg-[#b04a3a]'
                    : product.stock <= 5
                      ? 'bg-amber-500'
                      : 'bg-[#3f8f63]',
                )}
              />
              {isOutOfStock ? 'Habis' : `Tersedia: ${product.stock}`}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
