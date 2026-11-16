'use client';

import { parseJSend } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type OrderUiStatus =
  | 'Dikirim'
  | 'Diterima'
  | 'Dibatalkan'
  | 'Menunggu Bayar'
  | 'Dikonfirmasi'
  | 'Pengemasan';

export interface OrderItem {
  orderId: string;
  id: string;
  date: string;
  totalPrice: string;
  status: OrderUiStatus;
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentStatusLabel: string;
  paymentDeadlineAt: string | null;
  canCancel: boolean;
  products: Array<{
    category: string;
    name: string;
    location: string;
    quantity: number;
    imageURL: string | null;
    unitPrice: string;
  }>;
  actions: 'Detail'[];
}

export interface OrderDetail {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: OrderUiStatus;
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentStatusLabel: string;
  paymentMethod: string | null;
  paymentDeadlineAt: string | null;
  canCancel: boolean;
  totals: {
    subtotal: string;
    shippingCost: string;
    serviceFee: string;
    totalAmount: string;
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    quantity: number;
    unitPrice: string;
    imageURL: string | null;
  }>;
  shipping: {
    courier: string;
    courierService: string;
    trackingNumber: string | null;
    estimatedDelivery: string | null;
    recipientName: string;
    recipientPhone: string;
    fullAddress: string;
    city: string;
    province: string;
    district: string;
    subdistrict: string | null;
    postalCode: string;
  };
  paymentTransaction: {
    id: string;
    status: 'pending' | 'success' | 'failed' | 'expired';
    paymentUrl: string | null;
    vaNumber: string | null;
    paidAt: string | null;
    expiredAt: string | null;
    createdAt: string;
  } | null;
  customerNotes: string | null;
}

export interface PaginatedOrders {
  data: OrderItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (status: string | undefined, page: number, limit: number) =>
    [...orderKeys.lists(), status ?? 'Semua', page, limit] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (identifier: string) => [...orderKeys.details(), identifier] as const,
  cancel: () => [...orderKeys.all, 'cancel'] as const,
};

const ORDER_ERROR = 'Gagal mengambil data pesanan';
const orderPath = (identifier: string) =>
  `/api/orders/${encodeURIComponent(identifier)}`;

async function fetchOrders(
  status?: string,
  page: number = 1,
  limit: number = 5,
): Promise<PaginatedOrders> {
  const queryParams = new URLSearchParams();
  if (status && status !== 'Semua') {
    queryParams.set('status', status);
  }
  queryParams.set('page', page.toString());
  queryParams.set('limit', limit.toString());

  return parseJSend(await fetch(`/api/orders?${queryParams}`), ORDER_ERROR);
}

async function fetchOrderDetail(identifier: string): Promise<OrderDetail> {
  return parseJSend(await fetch(orderPath(identifier)), ORDER_ERROR);
}

async function cancelOrder(identifier: string): Promise<OrderDetail> {
  return parseJSend(
    await fetch(orderPath(identifier), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    }),
    ORDER_ERROR,
  );
}

export function useOrders(
  status?: string,
  page: number = 1,
  limit: number = 5,
) {
  return useQuery({
    queryKey: orderKeys.list(status, page, limit),
    queryFn: () => fetchOrders(status, page, limit),
    refetchInterval: 60_000,
  });
}

export function useOrderDetail(identifier: string) {
  return useQuery({
    queryKey: orderKeys.detail(identifier),
    queryFn: () => fetchOrderDetail(identifier),
    enabled: Boolean(identifier),
    refetchInterval: 60_000,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: orderKeys.cancel(),
    mutationFn: (identifier: string) => cancelOrder(identifier),
    onSuccess: (_, identifier) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(identifier) });
    },
  });
}
