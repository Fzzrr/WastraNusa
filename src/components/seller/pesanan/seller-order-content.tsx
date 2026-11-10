'use client';

import { SellerHeader } from '@/components/seller/seller-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  type SellerOrderItem,
  fetchSellerOrders,
  sellerOrderKeys,
  useSellerOrders,
  useUpdateSellerOrder,
} from '@/hooks/use-seller-order';
import type { AdminOrderUpdateInput } from '@/schemas/order.schema';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  FilterOrderStatus,
  FilterPaymentStatus,
  ORDER_STATUS_EDIT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  OrderDraft,
  PAYMENT_STATUS_OPTIONS,
  getOrderDraft,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  isEditableTargetStatus,
  isOrderEditable,
} from './order-helpers';

function TableRowSkeleton() {
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
    orderId: string,
    updater: (current: OrderDraft) => OrderDraft,
    order: SellerOrderItem,
  ) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [orderId]: updater(getOrderDraft(order, currentDrafts[orderId])),
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
                      <TableRowSkeleton key={index} />
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
                    orderData?.items.map((order) => {
                      const draft = getOrderDraft(order, drafts[order.orderId]);
                      const editable = isOrderEditable(order);
                      const selectedEditableStatus =
                        ORDER_STATUS_EDIT_OPTIONS.some(
                          (option) => option.value === draft.orderStatus,
                        )
                          ? draft.orderStatus
                          : // '' (not undefined) keeps the Select controlled.
                            '';
                      return (
                        <tr
                          key={order.orderId}
                          className="border-t border-border"
                        >
                          <td className="px-4 py-3 text-ink">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-small font-semibold">
                                {order.orderNumber}
                              </p>
                              <p className="text-[13px] text-muted-foreground/80">
                                {order.createdAtLabel} ·{' '}
                                {order.totalAmountLabel}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[15px] text-ink-soft">
                            <div className="flex flex-col">
                              <span className="font-semibold text-ink">
                                {order.customer.name}
                              </span>
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
                                  <span className="font-semibold text-ink">
                                    {product.name}
                                  </span>
                                  <span className="text-[13px] text-muted-foreground">
                                    {product.location} · Qty {product.quantity}{' '}
                                    · {product.unitPrice}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <Badge
                                variant="secondary"
                                className={getOrderStatusBadgeClass(
                                  order.orderStatus,
                                )}
                              >
                                {order.orderStatusLabel}
                              </Badge>
                              <Select
                                value={selectedEditableStatus}
                                onValueChange={(value: OrderStatus) =>
                                  handleDraftChange(
                                    order.orderId,
                                    (current) => ({
                                      ...current,
                                      orderStatus: value,
                                    }),
                                    order,
                                  )
                                }
                                disabled={!editable}
                              >
                                <SelectTrigger className="h-9 w-36 rounded-lg border-border bg-card text-[13px]">
                                  <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUS_EDIT_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
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
                              className={getPaymentStatusBadgeClass(
                                order.paymentStatus,
                              )}
                            >
                              {order.paymentStatusLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={draft.trackingNumber}
                              onChange={(event) =>
                                handleDraftChange(
                                  order.orderId,
                                  (current) => ({
                                    ...current,
                                    trackingNumber: event.target.value,
                                  }),
                                  order,
                                )
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
                              onClick={() => handleSave(order)}
                              disabled={!editable || savingId === order.orderId}
                            >
                              <Save data-icon="inline-start" />
                              Simpan
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          {orderData && orderData.meta.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between px-2">
              <p className="text-base text-muted-foreground">
                Halaman {page} dari {orderData.meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full border-border bg-background text-ink-soft hover:bg-surface"
                  onClick={() =>
                    setPage((currentPage) => Math.max(1, currentPage - 1))
                  }
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: orderData.meta.totalPages },
                    (_, index) => index + 1,
                  )
                    .filter((pageNumber) => {
                      if (orderData.meta.totalPages <= 5) return true;
                      if (
                        pageNumber === 1 ||
                        pageNumber === orderData.meta.totalPages
                      ) {
                        return true;
                      }
                      if (Math.abs(pageNumber - page) <= 1) return true;
                      return false;
                    })
                    .map((pageNumber, index, pages) => {
                      const showEllipsis =
                        index > 0 && pageNumber - pages[index - 1] > 1;

                      return (
                        <div
                          key={pageNumber}
                          className="flex items-center gap-1"
                        >
                          {showEllipsis ? (
                            <span className="px-1 text-ink-soft">...</span>
                          ) : null}
                          <Button
                            variant={
                              page === pageNumber ? 'default' : 'outline'
                            }
                            size="icon"
                            className={`size-8 rounded-full ${
                              page === pageNumber
                                ? 'bg-field text-white hover:bg-field/90'
                                : 'border-border bg-background text-ink-soft hover:bg-surface'
                            }`}
                            onClick={() => setPage(pageNumber)}
                            disabled={isLoading}
                          >
                            {pageNumber}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full border-border bg-background text-ink-soft hover:bg-surface"
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.min(orderData.meta.totalPages, currentPage + 1),
                    )
                  }
                  disabled={page === orderData.meta.totalPages || isLoading}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
