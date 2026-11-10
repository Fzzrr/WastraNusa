import { cn, formatIDR } from '@/lib/utils';
import type { ChatAttachedProduct } from '@/types/chat';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/** Compact product preview attached to a live-chat message or the composer. */
export function ChatProductCard({
  product,
  className,
}: {
  product: ChatAttachedProduct;
  className?: string;
}) {
  return (
    <Link
      href={`/catalog/${encodeURIComponent(product.slug)}`}
      className={cn(
        'flex min-w-0 items-center gap-2.5 rounded-xl bg-card p-2 text-ink transition-colors',
        className,
      )}
    >
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface text-ink-soft">
        {product.imageURL ? (
          <Image
            src={product.imageURL}
            alt={product.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <ShoppingBag className="size-5" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold">
          {product.name}
        </span>
        {product.variantName ? (
          <span className="block truncate text-[13px] text-ink-soft">
            Varian: {product.variantName}
          </span>
        ) : null}
        <span className="block text-[15px] font-semibold text-ink">
          {formatIDR(product.price)}
        </span>
      </span>
    </Link>
  );
}
