import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { demoteSellerSchema } from '@/schemas/seller-application.schema';
import { sellerManagementService } from '@/services/sellerManagement.service';

type Params = { id: string };

// POST /api/admin/seller-management/users/[id]/demote — revoke seller status
export const POST = withApiAdmin<Params>(async ({ req, userId, params }) => {
  const body = await req.json();
  const { reason } = demoteSellerSchema.parse(body);
  await sellerManagementService.demoteSeller(params.id, userId, reason);
  return jsend.success(null);
});
