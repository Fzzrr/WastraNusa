import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { adminDashboardService } from '@/services/adminDashboard.service';

// GET /api/admin/dashboard — aggregated admin dashboard overview.
export const GET = withApiAdmin(async () => {
  const overview = await adminDashboardService.getOverview();
  return jsend.success(overview);
});
