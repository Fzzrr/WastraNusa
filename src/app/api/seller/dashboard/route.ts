import { withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sellerDashboardService } from '@/services/sellerDashboard.service';

// GET /api/seller/dashboard?period=7|30|90 — seller sales overview.
export const GET = withApiSeller(async ({ req, userId }) => {
  const url = new URL(req.url);
  const period = Number(url.searchParams.get('period')) || 30;

  const overview = await sellerDashboardService.getOverview(userId, period);
  return jsend.success(overview);
});
