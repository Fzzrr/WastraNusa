import { ApiError } from '../error';
import { getSessionUser } from './auth';
import { isAdmin } from './roles';
import { hasSellerAccess } from './seller-access';

/**
 * Centralized authentication helpers for API routes
 */
export const AuthHelper = {
  getUser: getSessionUser,

  async requireUser() {
    const user = await this.getUser();

    if (!user) {
      throw new ApiError('Unauthorized access attempt detected', 401);
    }

    return user;
  },

  async requireAdmin() {
    const user = await this.requireUser();

    if (!isAdmin(user.role)) {
      throw new ApiError('Admin privileges required', 403);
    }

    return user;
  },

  async requireSeller() {
    const user = await this.requireUser();

    if (!(await hasSellerAccess(user))) {
      throw new ApiError('Seller privileges required', 403);
    }

    return user;
  },
};
