import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import type {
  SellerManagementRoleFilter,
  SellerManagementSort,
} from '@/repositories/sellerManagement.repository';
import { sellerManagementService } from '@/services/sellerManagement.service';

const ROLE_FILTERS: readonly SellerManagementRoleFilter[] = [
  'user',
  'seller',
  'pending',
  'rejected',
];
const SORTS: readonly SellerManagementSort[] = ['newest', 'oldest', 'name'];

// GET /api/admin/seller-management/users?search=&role=user|seller|pending|rejected&sort=newest|oldest|name
export const GET = withApiAdmin(async ({ req }) => {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || undefined;
  const roleParam = url.searchParams.get('role');
  const role = ROLE_FILTERS.includes(roleParam as SellerManagementRoleFilter)
    ? (roleParam as SellerManagementRoleFilter)
    : undefined;
  const sortParam = url.searchParams.get('sort');
  const sort = SORTS.includes(sortParam as SellerManagementSort)
    ? (sortParam as SellerManagementSort)
    : undefined;

  const users = await sellerManagementService.getUsers({ search, role, sort });
  return jsend.success(users);
});
