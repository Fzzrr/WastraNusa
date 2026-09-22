import { EncyclopediaPagination as Pagination } from '@/components/encyclopedia/encyclopedia-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderItem, useCancelOrder, useOrders } from '@/hooks/use-order';
import { Eye, Hexagon, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import type { OrderStatus } from './my-order-main';
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
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="h-5 w-20 bg-[#ece7dd] rounded"></div>
                <div className="h-5 w-32 bg-[#ece7dd] rounded"></div>
              </div>
              <div className="h-5 w-24 bg-[#ece7dd] rounded"></div>
            </div>
            <div className="h-[94px] bg-[#fbf8f2] border border-[#ece7dd] rounded-xl"></div>
            <div className="flex justify-between mt-1">
              <div className="h-5 w-32 bg-[#ece7dd] rounded"></div>
              <div className="h-8 w-24 bg-[#ece7dd] rounded"></div>
            </div>
            <div className="h-px w-full bg-[#ece7dd] mt-2 mb-1" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfbf] bg-[#fbf8f2]/50 text-[#726759]">
        <div className="mb-3 rounded-full bg-[#fdf6f2] p-4 text-[#c4826b]">
          <XCircle className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium">Gagal memuat pesanan.</p>
        <p className="mt-1 text-xs text-[#a29582]">
          Terjadi kesalahan saat mengambil data pesanan.
        </p>
      </div>
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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfbf] bg-[#fbf8f2]/50 text-[#726759]">
        <div className="mb-3 rounded-full bg-[#efe8db] p-4 text-[#ccbda4]">
          <Hexagon className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium">Belum ada pesanan.</p>
        <p className="mt-1 text-xs text-[#a29582]">
          Pesananmu yang sesuai filter ini akan muncul di sini.
        </p>
      </div>
    );
  }

  const getStatusBadgeColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'Diterima':
        return 'bg-[#eef3ef] text-[#5c7365]';
      case 'Dikirim':
        return 'bg-[#f4efe6] text-[#8b7e6a]';
      case 'Dibatalkan':
        return 'bg-[#fdf6f2] text-[#c4826b]';
      default:
        return 'bg-[#f4efe6] text-[#8b7e6a]';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {filteredOrders.map((order) => (
        <div key={order.id} className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={`rounded border-none px-2.5 py-0.5 text-[11px] font-semibold hover:bg-opacity-80 ${getStatusBadgeColor(
                order.status,
              )} hover:${getStatusBadgeColor(order.status).split(' ')[0]}`}
            >
              {order.status}
            </Badge>
            <div className="text-[14px] font-bold text-[#4d6356]">
              {order.totalPrice}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {order.products.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#ece7dd] bg-[#fbf8f2] p-4 transition-colors hover:border-[#dfd7ca]"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#efe8db] text-[#b0a591] border border-[#e8e2d5]">
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
                        <span className="mt-1 absolute bottom-1.5 text-[9px] font-semibold tracking-wide text-[#a39882] uppercase">
                          {product.category.substring(0, 4)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                    <div className="flex flex-wrap gap-1.5 mb-0.5">
                      <Badge
                        variant="secondary"
                        className="rounded border-none bg-[#f4efe6] px-2 py-0 text-[10px] font-medium text-[#c4826b] hover:bg-[#f4efe6]"
                      >
                        {product.category}
                      </Badge>
                    </div>
                    <h3 className="w-full truncate text-[15px] font-bold leading-none text-[#4d6356]">
                      {product.name}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-[#8f9b94] mt-0.5">
                      {product.location}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right flex flex-col items-end justify-center">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4efe6] text-[#5c7365] border border-[#ece7dd]">
                    {product.quantity} barang x {product.unitPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {order.canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-[#d8b5a7] text-[#b56d56] hover:bg-[#fdf6f2] hover:text-[#9d5a46] text-xs font-semibold px-4"
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
                className="h-8 gap-1.5 rounded-lg border-[#ece7dd] text-[#726759] text-xs font-semibold px-4"
                asChild
              >
                <Link
                  href={`/profile/my-order/${encodeURIComponent(order.id)}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Detail
                </Link>
              </Button>
            )}
          </div>

          {order.paymentDeadlineAt && order.status === 'Menunggu Bayar' && (
            <PaymentDeadlineBadge
              deadlineAt={order.paymentDeadlineAt}
              onExpire={() => {
                void refetch();
              }}
            />
          )}

          <div className="h-px w-full bg-[#ece7dd] mt-2 mb-1 last:hidden block" />
        </div>
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
