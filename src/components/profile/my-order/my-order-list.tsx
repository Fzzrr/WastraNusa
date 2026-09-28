import { EncyclopediaPagination as Pagination } from '@/components/encyclopedia/encyclopedia-pagination';
import {
  ProfileEmptyState,
  profileOutlineButtonClassName,
} from '@/components/profile/profile-section';
import { Badge } from '@/components/ui/badge';
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
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl ring-1 ring-[#efe8dd]"
          >
            <div className="flex justify-between bg-[#faf7f2] px-4 py-3">
              <div className="h-6 w-40 rounded-full bg-[#efe8dd]" />
              <div className="h-5 w-24 rounded bg-[#efe8dd]" />
            </div>
            <div className="flex gap-4 p-4">
              <div className="size-16 rounded-xl bg-[#efe8dd]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-[#efe8dd]" />
                <div className="h-3 w-1/3 rounded bg-[#f4efe5]" />
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
          className="animate-in overflow-hidden rounded-2xl bg-white ring-1 ring-[#efe8dd] transition-shadow duration-300 fill-mode-both fade-in slide-in-from-bottom-1 hover:shadow-[0_16px_32px_-22px_rgba(89,69,38,0.45)]"
          style={{ animationDelay: `${orderIndex * 60}ms` }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#efe8dd] bg-[#faf7f2] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <OrderStatusBadge status={order.status} />
              <span className="font-mono text-xs font-semibold text-[#6f6a62]">
                {order.id}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#9a8f80]">
              <CalendarDays className="size-3.5" />
              {order.date}
            </span>
          </header>

          <div className="flex flex-col divide-y divide-[#f4efe5]">
            {order.products.map((product, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-3.5">
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#efe8db] text-[#b0a591] ring-1 ring-[#e8e2d5]">
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
                      <span className="absolute bottom-1.5 mt-1 text-[9px] font-semibold tracking-wide text-[#a39882] uppercase">
                        {product.category.substring(0, 4)}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <Badge
                    variant="secondary"
                    className="rounded-full border-none bg-[#f6e4da] px-2 py-0 text-[10px] font-medium text-[#b8613f] hover:bg-[#f6e4da]"
                  >
                    {product.category}
                  </Badge>
                  <h3 className="w-full truncate text-[15px] font-bold text-[#2f4f3f]">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#9a8f80]">{product.location}</p>
                </div>

                <span className="shrink-0 rounded-full bg-[#f4efe5] px-2.5 py-1 text-xs font-semibold text-[#4d6356]">
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

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efe8dd] px-4 py-3">
            <p className="text-xs text-[#9a8f80]">
              Total Belanja
              <span className="ml-2 text-base font-extrabold text-[#2f5f49]">
                {order.totalPrice}
              </span>
            </p>
            <div className="flex items-center gap-2">
              {order.canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer rounded-xl border-[#f0cfc7] px-4 text-xs font-semibold text-[#b04a3a] hover:bg-[#f6e1dd] hover:text-[#9a3b2d]"
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
                    'h-8 px-4 text-xs font-semibold',
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
