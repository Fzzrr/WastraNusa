/**
 * Application roles.
 *
 * `role` is stored as a plain nullable string on the User model (managed by the
 * better-auth `admin()` plugin). A user with no role is treated as a normal
 * buyer. These helpers centralize the string comparisons that were previously
 * scattered as `user.role === 'admin'` literals.
 */
export const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isAdmin(role?: string | null): boolean {
  return role === ROLES.ADMIN;
}

export function isSeller(role?: string | null): boolean {
  return role === ROLES.SELLER;
}
