import { EncyclopediaPagination as Pagination } from '@/components/encyclopedia/encyclopedia-pagination';
import {
  ProfileEmptyState,
  profileOutlineButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { useCancelOrder, useOrders } from '@/hooks/use-order';
import { cn } from '@/lib/utils';
import { CalendarDays, Eye, Hexagon, ShoppingBag, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import type { OrderStatus } from './my-order-main';
import { OrderStatusBadge } from './order-status';
import { PaymentDeadlineBadge } from './payment-deadline-badge';

interface MyOrderListProps {
  activeTab: OrderStatus;
  page: number;
  setPage: (page: number) => void;
}

export function MyOrderList({ activeTab, page, setPage }: MyOrderListProps) {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useOrders(activeTab, page, 5);
  const cancelOrderMutation = useCancelOrder();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-xl">
            <div className="flex justify-between bg-surface px-4 py-3">
              <div className="h-6 w-40 rounded-full bg-surface" />
              <div className="h-5 w-24 rounded bg-surface" />
            </div>
            <div className="flex gap-4 p-4">
              <div className="size-16 rounded-xl bg-surface" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-surface" />
                <div className="h-3 w-1/3 rounded bg-surface" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ProfileEmptyState
        icon={XCircle}
        tone="error"
        title="Gagal memuat pesanan"
        description="Terjadi kesalahan saat mengambil data pesanan."
      />
    );
  }

  const orders = response?.data ?? [];
  const filteredOrders =
    activeTab === 'Semua'
      ? orders
      : orders.filter((order) => order.status === activeTab);
  const meta = response?.meta;

  if (filteredOrders.length === 0) {
    return (
      <ProfileEmptyState
        icon={ShoppingBag}
        title={
          activeTab === 'Semua'
            ? 'Belum ada pesanan'
            : `Tidak ada pesanan "${activeTab}"`
        }
        description="Pesanan Anda yang sesuai filter ini akan muncul di sini."
        action={
          <Button
            asChild
            variant="outline"
            className={cn(profileOutlineButtonClassName, 'h-9')}
          >
            <Link href="/catalog">
              <ShoppingBag className="size-3.5" />
              Mulai Belanja
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredOrders.map((order, orderIndex) => (
        <article
          key={order.id}
          className="animate-in overflow-hidden rounded-xl bg-card transition-shadow duration-300 fill-mode-both fade-in slide-in-from-bottom-1"
          style={{ animationDelay: `${orderIndex * 60}ms` }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <OrderStatusBadge status={order.status} />
              <span className="tabular-nums text-[13px] font-semibold text-ink-soft">
                {order.id}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
              <CalendarDays className="size-3.5" />
              {order.date}
            </span>
          </header>

          <div className="flex flex-col gap-1 py-2">
            {order.products.map((product, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-3.5">
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft">
                  {product.imageURL ? (
                    <Image
                      src={product.imageURL}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <>
                      <Hexagon
                        size={24}
                        strokeWidth={1.5}
                        className="text-ink-soft"
                      />
                      <span className="absolute bottom-1.5 mt-1 text-[13px] font-semibold text-ink-soft">
                        {product.category.substring(0, 4)}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <h3 className="w-full truncate text-base font-semibold text-ink">
                    {product.name}
                  </h3>
                  <p className="text-[13px] text-ink-soft">
                    {product.location}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink">
                  ×{product.quantity}
                </span>
              </div>
            ))}
          </div>

          {order.paymentDeadlineAt && order.status === 'Menunggu Bayar' && (
            <div className="px-4 pb-1">
              <PaymentDeadlineBadge
                deadlineAt={order.paymentDeadlineAt}
                onExpire={() => {
                  void refetch();
                }}
              />
            </div>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-3 px-4 pt-1 pb-4">
            <p className="text-[13px] text-ink-soft">
              Total Belanja
              <span className="ml-2 text-base font-bold text-ink">
                {order.totalPrice}
              </span>
            </p>
            <div className="flex items-center gap-2">
              {order.canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer rounded-full border-destructive/30 px-4 text-[13px] font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={cancelOrderMutation.isPending}
                  onClick={() => {
                    cancelOrderMutation.mutate(order.id, {
                      onSuccess: () => {
                        toast.success('Pesanan berhasil dibatalkan.');
                      },
                      onError: (error) => {
                        toast.error(error.message);
                      },
                    });
                  }}
                >
                  Batalkan
                </Button>
              )}
              {order.actions.includes('Detail') && (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    profileOutlineButtonClassName,
                    'h-8 px-4 text-[13px] font-semibold',
                  )}
                  asChild
                >
                  <Link
                    href={`/profile/my-order/${encodeURIComponent(order.id)}`}
                  >
                    <Eye className="size-3.5" />
                    Detail
                  </Link>
                </Button>
              )}
            </div>
          </footer>
        </article>
      ))}

      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
