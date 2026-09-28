import type { SellerApplicationStatus } from '@/generated/prisma/enums';
import type { JSendResponse } from '@/lib/jsend';
import type {
  SellerManagementRoleFilter,
  SellerManagementSort,
} from '@/repositories/sellerManagement.repository';
import type {
  CreateSellerApplicationInput,
  DemoteSellerInput,
  ReviewSellerApplicationInput,
} from '@/schemas/seller-application.schema';
import type {
  SellerManagementStats,
  SellerManagementUser,
} from '@/services/sellerManagement.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --------------- Types ---------------

export interface SellerApplication {
  id: string;
  userId: string;
  shopName: string;
  description: string | null;
  phoneNumber: string | null;
  status: SellerApplicationStatus;
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSellerApplication extends SellerApplication {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

// --------------- Query Key Factory ---------------

export const sellerApplicationKeys = {
  all: ['seller-applications'] as const,
  mine: () => [...sellerApplicationKeys.all, 'mine'] as const,
  adminLists: () => [...sellerApplicationKeys.all, 'admin', 'list'] as const,
  adminList: (status: SellerApplicationStatus | 'all') =>
    [...sellerApplicationKeys.adminLists(), status] as const,
  managementStats: () =>
    [...sellerApplicationKeys.all, 'management', 'stats'] as const,
  managementUsers: (
    search: string,
    role: SellerManagementRoleFilter | 'all',
    sort: SellerManagementSort,
  ) =>
    [
      ...sellerApplicationKeys.all,
      'management',
      'users',
      search,
      role,
      sort,
    ] as const,
};

// --------------- Fetch Helpers ---------------

async function parseJSend<T>(response: Response): Promise<T> {
  const body = (await response.json()) as JSendResponse<T>;

  if (body.status === 'success') {
    return body.data as T;
  }

  if (body.status === 'fail') {
    const message =
      typeof body.data === 'object' &&
      body.data !== null &&
      'message' in body.data
        ? String((body.data as { message: unknown }).message)
        : 'Request failed';
    throw new Error(message);
  }

  throw new Error(body.message);
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSend<T>(response);
}

async function mutateApi<T>(
  path: string,
  method: 'POST' | 'PATCH',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJSend<T>(response);
}

// --------------- User Hooks ---------------

/**
 * The authenticated user's own seller application (null if they never applied).
 */
export function useMySellerApplication() {
  return useQuery({
    queryKey: sellerApplicationKeys.mine(),
    queryFn: () =>
      fetchApi<SellerApplication | null>('/api/seller-applications'),
    staleTime: 1000 * 60,
  });
}

/**
 * Submit (or re-submit) a seller application.
 */
export function useCreateSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSellerApplicationInput) =>
      mutateApi<SellerApplication>('/api/seller-applications', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerApplicationKeys.mine() });
    },
  });
}

// --------------- Admin Hooks ---------------

/**
 * Admin: list seller applications, optionally filtered by status.
 */
export function useAdminSellerApplications(status?: SellerApplicationStatus) {
  return useQuery({
    queryKey: sellerApplicationKeys.adminList(status ?? 'all'),
    queryFn: () => {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      return fetchApi<AdminSellerApplication[]>(
        `/api/admin/seller-applications${query}`,
      );
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Admin: approve or reject a pending application.
 */
export function useReviewSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ReviewSellerApplicationInput;
    }) =>
      mutateApi<SellerApplication>(
        `/api/admin/seller-applications/${encodeURIComponent(id)}`,
        'PATCH',
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerApplicationKeys.all });
    },
  });
}

// --------------- Seller Management (admin) ---------------

export function useSellerManagementStats() {
  return useQuery({
    queryKey: sellerApplicationKeys.managementStats(),
    queryFn: () =>
      fetchApi<SellerManagementStats>('/api/admin/seller-management/stats'),
  });
}

export function useSellerManagementUsers(
  search: string,
  role: SellerManagementRoleFilter | 'all',
  sort: SellerManagementSort = 'newest',
) {
  return useQuery({
    queryKey: sellerApplicationKeys.managementUsers(search, role, sort),
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role !== 'all') params.set('role', role);
      if (sort !== 'newest') params.set('sort', sort);
      return fetchApi<SellerManagementUser[]>(
        `/api/admin/seller-management/users?${params.toString()}`,
      );
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useDemoteSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: DemoteSellerInput;
    }) =>
      mutateApi<null>(
        `/api/admin/seller-management/users/${encodeURIComponent(userId)}/demote`,
        'POST',
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerApplicationKeys.all });
    },
  });
}
