import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { ApiError } from '@/lib/error';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Every protected route must use the right guard. Only the expected guard
 * rejects here; a route wired to a weaker guard would get past it and not
 * answer with that guard's status.
 */
type Guard = 'requireUser' | 'requireSeller' | 'requireAdmin';
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const routes: [string, Method, Guard][] = [
  ['seller/dashboard/route', 'GET', 'requireSeller'],
  ['seller/orders/route', 'GET', 'requireSeller'],
  ['seller/orders/[id]/route', 'PUT', 'requireSeller'],
  ['seller/products/route', 'GET', 'requireSeller'],
  ['seller/products/route', 'POST', 'requireSeller'],
  ['seller/products/[id]/route', 'PUT', 'requireSeller'],
  ['seller/products/[id]/route', 'PATCH', 'requireSeller'],
  ['seller/products/[id]/route', 'DELETE', 'requireSeller'],
  ['seller/shop-profile/route', 'GET', 'requireSeller'],
  ['seller/shop-profile/route', 'PATCH', 'requireSeller'],
  ['admin/dashboard/route', 'GET', 'requireAdmin'],
  ['admin/seller-applications/route', 'GET', 'requireAdmin'],
  ['admin/seller-applications/[id]/route', 'PATCH', 'requireAdmin'],
  ['admin/seller-management/stats/route', 'GET', 'requireAdmin'],
  ['admin/seller-management/users/route', 'GET', 'requireAdmin'],
  ['admin/seller-management/users/[id]/demote/route', 'POST', 'requireAdmin'],
  ['articles/route', 'POST', 'requireAdmin'],
  ['articles/[id]/route', 'PUT', 'requireAdmin'],
  ['articles/[id]/route', 'DELETE', 'requireAdmin'],
  ['articles/field-options/route', 'GET', 'requireAdmin'],
  ['wikimedia/mobile-sections/route', 'GET', 'requireAdmin'],
  ['conversations/route', 'GET', 'requireUser'],
  ['conversations/route', 'POST', 'requireUser'],
  ['conversations/[id]/route', 'GET', 'requireUser'],
  ['conversations/[id]/messages/route', 'POST', 'requireUser'],
  ['sse/route', 'GET', 'requireUser'],
  ['seller-applications/route', 'GET', 'requireUser'],
  ['seller-applications/route', 'POST', 'requireUser'],
  ['checkout/route', 'POST', 'requireUser'],
];

const STATUS: Record<Guard, number> = {
  requireUser: 401,
  requireSeller: 403,
  requireAdmin: 403,
};

const auth = vi.mocked(AuthHelper);

describe('route guards', { tags: ['backend'] }, () => {
  beforeEach(() => {
    const user = { id: 'someone', role: 'user' } as never;
    auth.requireUser.mockResolvedValue(user);
    auth.requireSeller.mockResolvedValue(user);
    auth.requireAdmin.mockResolvedValue(user);
  });

  it.each(routes)('%s %s uses %s', async (path, method, guard) => {
    auth[guard].mockRejectedValue(new ApiError('ditolak', STATUS[guard]));
    const mod = await import(`@/app/api/${path}`);

    const res = await mod[method](
      new Request('http://localhost/api/test', {
        method,
        ...(method === 'GET' || method === 'DELETE' ? {} : { body: '{}' }),
      }),
      { params: Promise.resolve({ id: 'x' }) },
    );

    expect(res.status).toBe(STATUS[guard]);
    expect(auth[guard]).toHaveBeenCalled();
  });
});
