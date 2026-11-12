'use client';

import { SellerHeader } from '@/components/seller/seller-header';
import { TablePagination } from '@/components/table-pagination';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type SellerOrderItem,
  fetchSellerOrders,
  sellerOrderKeys,
  useSellerOrders,
  useUpdateSellerOrder,
} from '@/hooks/use-seller-order';
import type { AdminOrderUpdateInput } from '@/schemas/order.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  FilterOrderStatus,
  FilterPaymentStatus,
  ORDER_STATUS_FILTER_OPTIONS,
  OrderDraft,
  PAYMENT_STATUS_OPTIONS,
  getOrderDraft,
  isEditableTargetStatus,
} from './order-helpers';
import { OrderRow, OrderRowSkeleton } from './order-table-row';

export function SellerOrderContent() {
  const [page, setPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<FilterOrderStatus>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<FilterPaymentStatus>('all');
  const [drafts, setDrafts] = useState<Record<string, OrderDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      orderStatus: orderStatusFilter === 'all' ? undefined : orderStatusFilter,
      paymentStatus:
        paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
    }),
    [orderStatusFilter, paymentStatusFilter],
  );

  const { data: orderData, isLoading } = useSellerOrders(page, 10, filters);
  const { mutate: updateOrder } = useUpdateSellerOrder();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (orderData?.meta.hasNextPage) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: sellerOrderKeys.list(
          nextPage,
          10,
          filters.orderStatus ?? 'all',
          filters.paymentStatus ?? 'all',
        ),
        queryFn: () => fetchSellerOrders(nextPage, 10, filters),
      });
    }
  }, [page, orderData, queryClient, filters]);

  const handleDraftChange = (
    order: SellerOrderItem,
    patch: Partial<OrderDraft>,
  ) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [order.orderId]: {
        ...getOrderDraft(order, currentDrafts[order.orderId]),
        ...patch,
      },
    }));
  };

  const handleSave = (order: SellerOrderItem) => {
    const draft = getOrderDraft(order, drafts[order.orderId]);
    const payload: AdminOrderUpdateInput = {};

    if (draft.orderStatus !== order.orderStatus) {
      if (!isEditableTargetStatus(draft.orderStatus)) {
        toast.error('Status hanya boleh Pengemasan, Dikirim, atau Diterima');
        return;
      }
      payload.orderStatus = draft.orderStatus;
    }
    const normalizedTrackingNumber =
      draft.trackingNumber.trim() === '' ? null : draft.trackingNumber.trim();
    if (normalizedTrackingNumber !== order.trackingNumber) {
      payload.trackingNumber = normalizedTrackingNumber;
    }

    if (Object.keys(payload).length === 0) {
      toast.info('Tidak ada perubahan untuk disimpan');
      return;
    }

    setSavingId(order.orderId);
    updateOrder(
      {
        idOrOrderNumber: order.orderId,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success('Pesanan berhasil diperbarui');
          setDrafts((currentDrafts) => {
            const next = { ...currentDrafts };
            delete next[order.orderId];
            return next;
          });
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Gagal memperbarui pesanan',
          );
        },
        onSettled: () => {
          setSavingId(null);
        },
      },
    );
  };
  return (
    <main className="flex flex-col">
      <SellerHeader
        title="Manajemen Pesanan"
        subtitle="Kelola status pesanan pelanggan toko Anda"
      />

      <section className="flex-1 px-5 py-5 md:px-8">
        <div className="flex flex-col gap-4 rounded-xl bg-surface p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-base text-muted-foreground">
              {isLoading ? '...' : orderData?.meta.totalItems} Pesanan
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={orderStatusFilter}
                onValueChange={(value: FilterOrderStatus) => {
                  setOrderStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full rounded-m border-border bg-card sm:w-[190px]">
                  <SelectValue placeholder="Status Pesanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status Pesanan</SelectItem>
                  {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentStatusFilter}
                onValueChange={(value: FilterPaymentStatus) => {
                  setPaymentStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full rounded-m border-border bg-card sm:w-[180px]">
                  <SelectValue placeholder="Status Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pembayaran</SelectItem>
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="overflow-hidden rounded-xl border border-border bg-background py-0 ring-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface text-[13px] font-semibold text-ink-soft">
                  <tr>
                    <th className="px-4 py-3">Pesanan</th>
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Pembayaran</th>
                    <th className="px-4 py-3 text-center">No. Resi</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <OrderRowSkeleton key={index} />
                    ))
                  ) : orderData?.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-ink-soft"
                      >
                        Belum ada data pesanan.
                      </td>
                    </tr>
                  ) : (
                    orderData?.items.map((order) => (
                      <OrderRow
                        key={order.orderId}
                        order={order}
                        draft={getOrderDraft(order, drafts[order.orderId])}
                        isSaving={savingId === order.orderId}
                        onDraftChange={(patch) =>
                          handleDraftChange(order, patch)
                        }
                        onSave={() => handleSave(order)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          <TablePagination
            page={page}
            totalPages={orderData?.meta.totalPages ?? 1}
            onPageChange={setPage}
            disabled={isLoading}
            className="border-t-0 px-2 py-0"
          />
        </div>
      </section>
    </main>
  );
}
