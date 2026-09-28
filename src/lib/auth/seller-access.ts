import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';

import { isAdmin, isSeller } from './roles';

/**
 * Seller-panel access: sellers always; admins only once they have an approved
 * shop (admins keep the `admin` role, so their shop is the application record).
 */
export async function hasSellerAccess(user: {
  id: string;
  role?: string | null;
}): Promise<boolean> {
  if (isSeller(user.role)) return true;
  if (!isAdmin(user.role)) return false;
  return sellerApplicationRepository.hasApprovedApplication(user.id);
}
