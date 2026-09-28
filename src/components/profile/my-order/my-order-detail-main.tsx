'use client';

import {
  ProfileEmptyState,
  ProfileSection,
  profileCardClassName,
  profileOutlineButtonClassName,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { useCancelOrder, useOrderDetail } from '@/hooks/use-order';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Box,
  CreditCard,
  Hexagon,
  type LucideIcon,
  MapPin,
  Package,
  Receipt,
  Truck,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import {
  ORDER_PROGRESS,
  ORDER_STATUS_STYLES,
  OrderStatusBadge,
  type OrderStatusLabel,
} from './order-status';

interface MyOrderDetailMainProps {
  orderId: string;
}

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#efe8dd] md:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-[#f5ead3] text-[#a07a2c]">
          <Icon className="size-4" />
        </span>
        <p className="font-semibold text-[#2f4f3f]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 text-sm',
        emphasis
          ? 'mt-2 border-t border-dashed border-[#e3d9c7] pt-3'
          : 'text-[#6f6a62]',
      )}
    >
      <span className={emphasis ? 'font-semibold text-[#2f4f3f]' : ''}>
        {label}
      </span>
      <span
        className={cn(
          'text-right',
          emphasis
            ? 'text-lg font-extrabold text-[#2f5f49]'
            : 'font-medium text-[#3d4f45]',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Step tracker along the happy path; cancelled orders show a notice instead. */
function OrderProgress({ status }: { status: OrderStatusLabel }) {
  if (status === 'Dibatalkan') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[#f6e1dd] px-4 py-3 text-sm text-[#9a3b2d]">
        <XCircle className="size-5 shrink-0" />
        Pesanan ini telah dibatalkan.
      </div>
    );
  }

  const currentIndex = ORDER_PROGRESS.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_PROGRESS.map((step, index) => {
        const Icon = ORDER_STATUS_STYLES[step].icon;
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="relative flex flex-col items-center gap-2">
            {index > 0 ? (
              <span
                className={cn(
                  'absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2',
                  index <= currentIndex ? 'bg-[#2f5f49]' : 'bg-[#e8dfd0]',
                )}
              />
            ) : null}
            <span
              className={cn(
                'relative grid size-8 place-items-center rounded-full ring-4 ring-white transition-colors',
                isCurrent
                  ? 'bg-gradient-to-br from-[#caa86a] to-[#e8cb8d] text-[#3c2e14] shadow-[0_0_0_4px_rgba(232,203,141,0.35)]'
                  : isDone
                    ? 'bg-[#2f5f49] text-white'
                    : 'bg-[#f4efe5] text-[#b3aa9e]',
              )}
            >
              <Icon className="size-4" />
            </span>
            <span
              className={cn(
                'text-center text-[11px] leading-tight',
                isCurrent
                  ? 'font-semibold text-[#2f4f3f]'
                  : isDone
                    ? 'text-[#4d6356]'
                    : 'text-[#b3aa9e]',
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function MyOrderDetailMain({ orderId }: MyOrderDetailMainProps) {
  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const cancelOrderMutation = useCancelOrder();

  if (isLoading) {
    return (
      <div className={cn(profileCardClassName, 'animate-pulse space-y-4 p-6')}>
        <div className="h-10 w-56 rounded-xl bg-[#efe8dd]" />
        <div className="h-20 rounded-2xl bg-[#f4efe5]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-2xl bg-[#f4efe5]" />
          <div className="h-40 rounded-2xl bg-[#f4efe5]" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <ProfileEmptyState
        icon={XCircle}
        tone="error"
        title="Gagal memuat pesanan"
        description="Terjadi kesalahan saat mengambil detail pesanan."
        action={
          <Button
            asChild
            variant="outline"
            className={cn(profileOutlineButtonClassName, 'h-9')}
          >
            <Link href="/profile/my-order">
              <ArrowLeft className="size-3.5" />
              Kembali ke Pesanan
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <ProfileSection
      icon={Receipt}
      title={
        <span className="flex flex-wrap items-center gap-2">
          Detail Pesanan
          <span className="rounded-md bg-[#f4efe5] px-2 py-0.5 font-mono text-xs font-semibold text-[#6f6a62]">
            {order.orderNumber}
          </span>
        </span>
      }
      description={order.orderDate}
      aside={
        <Button
          variant="outline"
          size="sm"
          className={cn(profileOutlineButtonClassName, 'h-9')}
          asChild
        >
          <Link href="/profile/my-order">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
      }
      bodyClassName="space-y-4 bg-[#faf7f2]/60"
    >
      <DetailCard icon={Package} title="Status Pesanan">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          {order.canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 cursor-pointer rounded-xl border-[#f0cfc7] text-xs font-semibold text-[#b04a3a] hover:bg-[#f6e1dd] hover:text-[#9a3b2d]"
              disabled={cancelOrderMutation.isPending}
              onClick={() => {
                cancelOrderMutation.mutate(order.orderNumber, {
                  onSuccess: () => {
                    toast.success('Pesanan berhasil dibatalkan.');
                  },
                  onError: (error) => {
                    toast.error(error.message);
                  },
                });
              }}
            >
              Batalkan Pesanan
            </Button>
          )}
        </div>
        <OrderProgress status={order.orderStatus} />
      </DetailCard>

      <DetailCard icon={Box} title="Produk">
        <div className="flex flex-col divide-y divide-[#f4efe5]">
          {order.products.map((product, index) => (
            <div key={index} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#efe8db] text-[#b0a591] ring-1 ring-[#e8e2d5]">
                {product.imageURL ? (
                  <Image
                    src={product.imageURL}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <Hexagon
                      size={24}
                      strokeWidth={1.5}
                      className="text-[#c4b9a3]"
                    />
                    <span className="absolute bottom-1.5 mt-1 text-[8px] font-semibold tracking-wide text-[#a39882] uppercase">
                      {product.category.substring(0, 4)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-semibold text-[#2f4f3f]">{product.name}</p>
                <p className="mt-0.5 text-xs text-[#9a8f80]">
                  {product.category} · {product.location}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[#f4efe5] px-2.5 py-0.5 font-semibold text-[#4d6356]">
                    ×{product.quantity}
                  </span>
                  <span className="text-[#6f6a62]">
                    @ <span className="font-semibold">{product.unitPrice}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DetailCard>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard icon={MapPin} title="Pengiriman">
          <p className="font-semibold text-[#2f4f3f]">
            {order.shipping.recipientName}
            <span className="ml-1.5 text-xs font-normal text-[#9a8f80]">
              {order.shipping.recipientPhone}
            </span>
          </p>
          <p className="mt-1 text-sm text-[#6f6a62]">
            {order.shipping.fullAddress}
          </p>
          <p className="mt-1 text-xs text-[#9a8f80]">
            {order.shipping.district}, {order.shipping.city},{' '}
            {order.shipping.province} {order.shipping.postalCode}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4eff2] px-2.5 py-1 font-semibold text-[#2f6a7a]">
              <Truck className="size-3.5" />
              {order.shipping.courier} {order.shipping.courierService}
            </span>
            {order.shipping.trackingNumber ? (
              <span className="rounded-full bg-[#f4efe5] px-2.5 py-1 font-mono text-[#4d6356]">
                Resi: {order.shipping.trackingNumber}
              </span>
            ) : null}
          </div>
        </DetailCard>

        <DetailCard icon={CreditCard} title="Pembayaran">
          <div className="space-y-1.5">
            <SummaryRow label="Subtotal" value={order.totals.subtotal} />
            <SummaryRow label="Ongkir" value={order.totals.shippingCost} />
            {order.paymentMethod && (
              <SummaryRow label="Metode" value={order.paymentMethod} />
            )}
            {order.paymentTransaction?.vaNumber && (
              <SummaryRow
                label="VA Number"
                value={
                  <span className="font-mono">
                    {order.paymentTransaction.vaNumber}
                  </span>
                }
              />
            )}
            <SummaryRow
              label="Total"
              value={order.totals.totalAmount}
              emphasis
            />
          </div>
          {order.paymentTransaction?.paymentUrl &&
            order.paymentStatus === 'unpaid' && (
              <Button
                className={cn(
                  profilePrimaryButtonClassName,
                  'mt-4 h-10 w-full',
                )}
                asChild
              >
                <a
                  href={order.paymentTransaction.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <CreditCard className="size-4" />
                  Lanjutkan Pembayaran
                </a>
              </Button>
            )}
        </DetailCard>
      </div>
    </ProfileSection>
  );
}
