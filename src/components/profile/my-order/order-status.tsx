import type { OrderItem } from '@/hooks/use-order';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  type LucideIcon,
  PackageCheck,
  PackageOpen,
  Truck,
  XCircle,
} from 'lucide-react';

export type OrderStatusLabel = OrderItem['status'];

/** Colour + icon per order status, shared by the order list and detail. */
export const ORDER_STATUS_STYLES: Record<
  OrderStatusLabel,
  { icon: LucideIcon; className: string }
> = {
  'Menunggu Bayar': { icon: Clock, className: 'bg-[#fbf0d9] text-[#a0702a]' },
  Dikonfirmasi: {
    icon: CheckCircle2,
    className: 'bg-[#e6ecf3] text-[#34507a]',
  },
  Pengemasan: { icon: PackageOpen, className: 'bg-[#efe6f3] text-[#6b4f7a]' },
  Dikirim: { icon: Truck, className: 'bg-[#e4eff2] text-[#2f6a7a]' },
  Diterima: { icon: PackageCheck, className: 'bg-[#e3ece5] text-[#2f5f49]' },
  Dibatalkan: { icon: XCircle, className: 'bg-[#f6e1dd] text-[#b04a3a]' },
};

/** Happy-path order of statuses, used for the progress tracker. */
export const ORDER_PROGRESS: OrderStatusLabel[] = [
  'Menunggu Bayar',
  'Dikonfirmasi',
  'Pengemasan',
  'Dikirim',
  'Diterima',
];

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatusLabel;
  className?: string;
}) {
  const style = ORDER_STATUS_STYLES[status];
  const Icon = style?.icon ?? Clock;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        style?.className ?? 'bg-[#f1ede6] text-[#6f6a62]',
        className,
      )}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  );
}
