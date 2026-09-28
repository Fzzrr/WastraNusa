import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { reviewSellerApplicationSchema } from '@/schemas/seller-application.schema';
import { sellerApplicationService } from '@/services/sellerApplication.service';

type Params = { id: string };

// PATCH /api/admin/seller-applications/[id] — approve or reject an application
export const PATCH = withApiAdmin<Params>(async ({ req, userId, params }) => {
  const body = await req.json();
  const data = reviewSellerApplicationSchema.parse(body);
  const application = await sellerApplicationService.reviewApplication(
    params.id,
    userId,
    data,
  );
  return jsend.success(application);
});
