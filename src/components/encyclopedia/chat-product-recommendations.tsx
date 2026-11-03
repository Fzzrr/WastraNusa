import { formatIDR } from '@/lib/utils';
import type { ChatProduct } from '@/types/chat';
import Image from 'next/image';
import Link from 'next/link';

export function ChatProductRecommendations({
  products,
}: {
  products: ChatProduct[];
}) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {products.map((product) => (
        <li key={product.slug}>
          <Link
            href={product.href}
            className="flex gap-3 rounded-xl border border-border bg-background p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            {product.imageURL && (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.imageURL}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-semibold">{product.name}</span>
              <span className="font-medium">
                {formatIDR(product.priceMin)}
                {product.priceMax !== product.priceMin &&
                  ` – ${formatIDR(product.priceMax)}`}
              </span>
              {product.description && (
                <p className="line-clamp-2 text-muted-foreground">
                  {product.description}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
