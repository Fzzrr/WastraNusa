import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { createSellerApplicationSchema } from '@/schemas/seller-application.schema';
import { sellerApplicationService } from '@/services/sellerApplication.service';

// GET /api/seller-applications — the authenticated user's own application
export const GET = withApiAuth(async ({ userId }) => {
  const application = await sellerApplicationService.getMyApplication(userId);
  return jsend.success(application);
});

// POST /api/seller-applications — submit (or re-submit) a seller application
export const POST = withApiAuth(async ({ req, userId }) => {
  const body = await req.json();
  const data = createSellerApplicationSchema.parse(body);
  const application = await sellerApplicationService.createApplication(
    userId,
    data,
  );
  return jsend.success(application, 201);
});
