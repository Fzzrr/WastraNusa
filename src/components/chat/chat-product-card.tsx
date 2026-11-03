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
        'flex min-w-0 items-center gap-2.5 rounded-xl bg-white p-2 text-[#2f3a33] ring-1 ring-[#ebe3d6] transition-colors hover:ring-[#2f5f49]/40',
        className,
      )}
    >
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f1ebdf] text-[#a07a2c]">
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
        <span className="block truncate text-xs font-semibold">
          {product.name}
        </span>
        {product.variantName ? (
          <span className="block truncate text-xs text-[#7d7465]">
            Varian: {product.variantName}
          </span>
        ) : null}
        <span className="block text-xs font-bold text-[#2f5f49]">
          {formatIDR(product.price)}
        </span>
      </span>
    </Link>
  );
}
