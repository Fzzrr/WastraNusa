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
  const CurrentIcon = STEPS[step - 1].icon;

  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d] shadow-[0_10px_20px_-10px_rgba(47,75,61,0.8)]">
          <CurrentIcon className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2f4f3f] md:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-[#9a8f80]">{description}</p>
        </div>
      </div>

      <ol className="flex items-center gap-1 rounded-2xl bg-[#fffdf8] p-1.5 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_8px_24px_rgba(89,69,38,0.06)] ring-1 ring-[#e8dfd0]">
        {STEPS.map(({ label, icon: Icon, href }, index) => {
          const number = index + 1;
          const isDone = number < step;
          const isCurrent = number === step;
          const content = (
            <>
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors',
                  isCurrent
                    ? 'bg-white/20 text-[#e8cb8d]'
                    : isDone
                      ? 'bg-[#2f5f49] text-white'
                      : 'bg-[#f1ede6] text-[#b3aa9e]',
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
            'flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-all',
            isCurrent
              ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-white shadow-[0_6px_14px_-8px_rgba(47,95,73,0.8)]'
              : isDone
                ? 'text-[#2f5f49] hover:bg-[#e3ece5]'
                : 'text-[#b3aa9e]',
          );

          return (
            <li key={label} className="flex items-center gap-1">
              {index > 0 ? (
                <span
                  className={cn(
                    'h-0.5 w-4 rounded-full sm:w-6',
                    number <= step ? 'bg-[#2f5f49]' : 'bg-[#e8dfd0]',
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
