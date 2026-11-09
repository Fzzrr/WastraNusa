import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';

import { isSeller } from './roles';

/**
 * Seller-panel access, decided by the role stored in the DB. The session
 * cookie caches the role for up to a minute, so reading the DB means a
 * just-approved seller gets in, and a demoted one is out, right away.
 */
export async function hasSellerAccess(user: { id: string }): Promise<boolean> {
  return isSeller(await sellerApplicationRepository.findUserRole(user.id));
}
