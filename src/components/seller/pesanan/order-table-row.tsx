import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/generated/prisma/enums';
import { type SellerOrderItem } from '@/hooks/use-seller-order';
import { Save } from 'lucide-react';

import {
  ORDER_STATUS_EDIT_OPTIONS,
  type OrderDraft,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  isOrderEditable,
} from './order-helpers';

export function OrderRowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-28 bg-surface" />
          <Skeleton className="h-4 w-36 bg-surface" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-36 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-24 rounded-md bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-24 rounded-md bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-9 w-36 rounded-lg bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-9 w-28 rounded-lg bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-9 w-20 rounded-lg bg-surface" />
      </td>
    </tr>
  );
}

export function OrderRow({
  order,
  draft,
  isSaving,
  onDraftChange,
  onSave,
}: {
  order: SellerOrderItem;
  draft: OrderDraft;
  isSaving: boolean;
  onDraftChange: (patch: Partial<OrderDraft>) => void;
  onSave: () => void;
}) {
  const editable = isOrderEditable(order);
  const selectedEditableStatus = ORDER_STATUS_EDIT_OPTIONS.some(
    (option) => option.value === draft.orderStatus,
  )
    ? draft.orderStatus
    : // '' (not undefined) keeps the Select controlled.
      '';

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 text-ink">
        <div className="flex flex-col gap-0.5">
          <p className="text-small font-semibold">{order.orderNumber}</p>
          <p className="text-[13px] text-muted-foreground/80">
            {order.createdAtLabel} · {order.totalAmountLabel}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 text-[15px] text-ink-soft">
        <div className="flex flex-col">
          <span className="font-semibold text-ink">{order.customer.name}</span>
          <span className="text-[13px] text-muted-foreground">
            {order.customer.email}
          </span>
          <span className="mt-2 text-[13px] text-ink">
            Kirim ke{' '}
            <span className="font-semibold">
              {order.shipping.recipientName}
            </span>{' '}
            ({order.shipping.phone})
          </span>
          <span className="max-w-64 text-[13px] leading-relaxed">
            {order.shipping.address}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {order.shipping.courier}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-[15px] text-ink-soft">
        <div className="flex flex-col gap-2">
          {order.products.map((product, index) => (
            <div key={index} className="flex flex-col">
              <span className="font-semibold text-ink">{product.name}</span>
              <span className="text-[13px] text-muted-foreground">
                {product.location} · Qty {product.quantity} ·{' '}
                {product.unitPrice}
              </span>
            </div>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <Badge
            variant="secondary"
            className={getOrderStatusBadgeClass(order.orderStatus)}
          >
            {order.orderStatusLabel}
          </Badge>
          <Select
            value={selectedEditableStatus}
            onValueChange={(value: OrderStatus) =>
              onDraftChange({ orderStatus: value })
            }
            disabled={!editable}
          >
            <SelectTrigger className="h-9 w-36 rounded-lg border-border bg-card text-[13px]">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_EDIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <Badge
          variant="secondary"
          className={getPaymentStatusBadgeClass(order.paymentStatus)}
        >
          {order.paymentStatusLabel}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Input
          value={draft.trackingNumber}
          onChange={(event) =>
            onDraftChange({ trackingNumber: event.target.value })
          }
          placeholder="Isi no. resi"
          className="h-9 rounded-lg border-border bg-card text-[15px]"
          disabled={!editable}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          className="h-9 rounded-full"
          onClick={onSave}
          disabled={!editable || isSaving}
        >
          <Save data-icon="inline-start" />
          Simpan
        </Button>
      </td>
    </tr>
  );
}
