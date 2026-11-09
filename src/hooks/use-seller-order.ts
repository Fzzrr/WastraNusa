import type { OrderStatus, PaymentStatus } from '@/generated/prisma/enums';
import { fetchApi, mutateApi } from '@/lib/api-client';
import type { AdminOrderUpdateInput } from '@/schemas/order.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type SellerOrderItem = {
  orderId: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  shipping: {
    recipientName: string;
    phone: string;
    address: string;
    courier: string;
  };
  products: Array<{
    id: string;
    name: string;
    location: string;
    category: string;
    quantity: number;
    unitPrice: string;
  }>;
  totalAmount: number;
  totalAmountLabel: string;
  orderStatus: OrderStatus;
  orderStatusLabel: string;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  trackingNumber: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type SellerOrderListResponse = {
  items: SellerOrderItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

export type SellerOrderFilters = {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export const sellerOrderKeys = {
  all: ['seller-orders'] as const,
  lists: () => [...sellerOrderKeys.all, 'list'] as const,
  list: (
    page: number,
    limit: number,
    orderStatus: OrderStatus | 'all',
    paymentStatus: PaymentStatus | 'all',
  ) =>
    [
      ...sellerOrderKeys.lists(),
      page,
      limit,
      orderStatus,
      paymentStatus,
    ] as const,
  details: () => [...sellerOrderKeys.all, 'detail'] as const,
  detail: (idOrOrderNumber: string) =>
    [...sellerOrderKeys.details(), idOrOrderNumber] as const,
};

export function fetchSellerOrders(
  page: number = 1,
  limit: number = 10,
  filters: SellerOrderFilters = {},
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters.orderStatus) {
    searchParams.set('orderStatus', filters.orderStatus);
  }
  if (filters.paymentStatus) {
    searchParams.set('paymentStatus', filters.paymentStatus);
  }

  return fetchApi<SellerOrderListResponse>(
    `/api/seller/orders?${searchParams.toString()}`,
  );
}

export function useSellerOrders(
  page: number = 1,
  limit: number = 10,
  filters: SellerOrderFilters = {},
) {
  return useQuery({
    queryKey: sellerOrderKeys.list(
      page,
      limit,
      filters.orderStatus ?? 'all',
      filters.paymentStatus ?? 'all',
    ),
    queryFn: () => fetchSellerOrders(page, limit, filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateSellerOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      idOrOrderNumber,
      data,
    }: {
      idOrOrderNumber: string;
      data: AdminOrderUpdateInput;
    }) =>
      mutateApi<SellerOrderItem>(
        `/api/seller/orders/${encodeURIComponent(idOrOrderNumber)}`,
        'PUT',
        data,
      ),
    onSuccess: (_, { idOrOrderNumber }) => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
      queryClient.invalidateQueries({
        queryKey: sellerOrderKeys.detail(idOrOrderNumber),
      });
    },
  });
}
