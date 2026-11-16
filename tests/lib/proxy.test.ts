import { proxy } from '@/proxy';
import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('better-auth/cookies', () => ({ getSessionCookie: vi.fn() }));

const run = (path: string) =>
  proxy(new NextRequest(new URL(path, 'http://localhost:3000')));

describe('proxy', { tags: ['backend'] }, () => {
  it.each(['/cart', '/chat'])(
    'redirects guests from %s to /login without session_expired',
    async (path) => {
      vi.mocked(getSessionCookie).mockReturnValue(null);

      const response = await run(path);

      expect(response.headers.get('location')).toBe(
        `http://localhost:3000/login?redirect=${encodeURIComponent(path)}`,
      );
    },
  );

  it('keeps the query string in the redirect target', async () => {
    vi.mocked(getSessionCookie).mockReturnValue(null);

    const response = await run('/chat?product=abc');

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?redirect=%2Fchat%3Fproduct%3Dabc',
    );
  });

  it('lets signed-in users through to /chat', async () => {
    vi.mocked(getSessionCookie).mockReturnValue('token');

    const response = await run('/chat');

    expect(response.headers.get('location')).toBeNull();
  });
});
