import { cn } from '@/lib/utils';
import {
  Check,
  CreditCard,
  type LucideIcon,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

const STEPS: { label: string; icon: LucideIcon; href: string }[] = [
  { label: 'Keranjang', icon: ShoppingCart, href: '/cart' },
  { label: 'Pengiriman', icon: Truck, href: '/cart/checkout' },
  { label: 'Pembayaran', icon: CreditCard, href: '/cart/checkout/payment' },
];

/**
 * Page header for the purchase flow: title on the left, 3-step progress on
 * the right. Completed steps link back so shoppers can revise earlier steps.
 */
export function CheckoutHeader({
  step,
  title,
  description,
}: {
  step: 1 | 2 | 3;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[clamp(2rem,3.6vw,3rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-1 text-base text-ink-soft">{description}</p>
      </div>

      <ol className="flex items-center gap-1 rounded-full bg-surface p-1">
        {STEPS.map(({ label, icon: Icon, href }, index) => {
          const number = index + 1;
          const isDone = number < step;
          const isCurrent = number === step;
          const content = (
            <>
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-[15px] font-semibold transition-colors',
                  isCurrent
                    ? 'bg-white/20 text-gold'
                    : isDone
                      ? 'bg-brand text-on-field'
                      : 'bg-surface text-ink-soft',
                )}
              >
                {isDone ? (
                  <Check className="size-3.5" />
                ) : (
                  <Icon className="size-3.5" />
                )}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </>
          );
          const className = cn(
            'flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[15px] font-semibold whitespace-nowrap transition-all',
            isCurrent
              ? 'bg-brand text-on-field'
              : isDone
                ? 'text-ink hover:bg-surface'
                : 'text-ink-soft',
          );

          return (
            <li key={label} className="flex items-center gap-1">
              {index > 0 ? (
                <span
                  className={cn(
                    'h-0.5 w-4 rounded-full sm:w-6',
                    number <= step ? 'bg-brand' : 'bg-surface',
                  )}
                />
              ) : null}
              {isDone ? (
                <Link href={href} className={className}>
                  {content}
                </Link>
              ) : (
                <span
                  className={className}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
