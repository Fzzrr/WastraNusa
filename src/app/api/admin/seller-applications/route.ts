import { SellerApplicationStatus } from '@/generated/prisma/enums';
import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sellerApplicationService } from '@/services/sellerApplication.service';

// GET /api/admin/seller-applications — list applications (optional ?status=)
export const GET = withApiAdmin(async ({ req }) => {
  const url = new URL(req.url);
  const statusParam = url.searchParams.get('status');

  const status = Object.values(SellerApplicationStatus).includes(
    statusParam as SellerApplicationStatus,
  )
    ? (statusParam as SellerApplicationStatus)
    : undefined;

  const applications = await sellerApplicationService.getApplications(status);
  return jsend.success(applications);
});
