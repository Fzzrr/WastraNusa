import { ApiError } from '../error';
import { getSessionUser } from './auth';

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

    if (user.role !== 'admin') {
      throw new ApiError('Admin privileges required', 403);
    }

    return user;
  },
};
