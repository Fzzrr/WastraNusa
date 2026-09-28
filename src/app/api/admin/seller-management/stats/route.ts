import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sellerManagementService } from '@/services/sellerManagement.service';

// GET /api/admin/seller-management/stats — seller & sales KPI cards.
export const GET = withApiAdmin(async () => {
  const stats = await sellerManagementService.getStats();
  return jsend.success(stats);
});
