import { getSessionUser } from '@/lib/auth/auth';
import { requireAdmin, requireUser } from '@/lib/auth/auth-page-helper';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// next/navigation's redirect() throws internally in real Next.js, halting
// execution right after the call; mock it the same way so callers that check
// role/etc. after an early redirect are exercised realistically.
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/auth/auth', () => ({
  getSessionUser: vi.fn(),
}));

const mockedGetSessionUser = vi.mocked(getSessionUser);
const mockedRedirect = vi.mocked(redirect);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth-page-helper', { tags: ['backend'] }, () => {
  describe('requireUser', () => {
    it('returns the user when a session exists', async () => {
      mockedGetSessionUser.mockResolvedValue({
        id: 'u1',
        role: 'user',
      } as never);

      const user = await requireUser();

      expect(user).toEqual({ id: 'u1', role: 'user' });
      expect(mockedRedirect).not.toHaveBeenCalled();
    });

    it('redirects to login when there is no session', async () => {
      mockedGetSessionUser.mockResolvedValue(null);

      await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT');

      expect(mockedRedirect).toHaveBeenCalledWith(
        '/login?session_expired=true',
      );
    });
  });

  describe('requireAdmin', () => {
    it('returns the user when the role is admin', async () => {
      mockedGetSessionUser.mockResolvedValue({
        id: 'a1',
        role: 'admin',
      } as never);

      const user = await requireAdmin();

      expect(user).toEqual({ id: 'a1', role: 'admin' });
      expect(mockedRedirect).not.toHaveBeenCalled();
    });

    it('redirects home when authenticated but not an admin', async () => {
      mockedGetSessionUser.mockResolvedValue({
        id: 'u1',
        role: 'user',
      } as never);

      await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT');

      expect(mockedRedirect).toHaveBeenCalledWith('/');
    });

    it('redirects to login when there is no session', async () => {
      mockedGetSessionUser.mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT');

      expect(mockedRedirect).toHaveBeenCalledWith(
        '/login?session_expired=true',
      );
    });
  });
});
