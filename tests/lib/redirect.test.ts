import { getSafeRedirect } from '@/lib/auth/redirect';
import { describe, expect, it } from 'vitest';

describe('getSafeRedirect', { tags: ['backend'] }, () => {
  it.each(['/cart', '/catalog/kebaya?x=1'])('accepts same-origin %s', (v) => {
    expect(getSafeRedirect(v)).toBe(v);
  });

  it.each([
    '//evil.com',
    '/\\evil.com',
    'https://evil.com',
    'cart',
    '',
    undefined,
    ['/cart'],
  ])('rejects %s', (v) => {
    expect(getSafeRedirect(v)).toBeUndefined();
  });
});
