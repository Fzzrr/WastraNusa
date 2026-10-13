import { withApiSeller } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { updateShopProfileSchema } from '@/schemas/shop-profile.schema';
import { shopProfileService } from '@/services/shopProfile.service';

// GET /api/seller/shop-profile — the authenticated seller's own shop profile
export const GET = withApiSeller(async ({ userId }) => {
  const profile = await shopProfileService.getMyShopProfile(userId);
  return jsend.success(profile);
});

// PATCH /api/seller/shop-profile — update the authenticated seller's profile
export const PATCH = withApiSeller(async ({ req, userId }) => {
  const body = await req.json();
  const data = updateShopProfileSchema.parse(body);
  const profile = await shopProfileService.updateMyShopProfile(userId, data);
  return jsend.success(profile);
});
