/**
 * Returns `value` only when it is a same-origin path, so `?redirect=` can't be
 * used to bounce users to another site (`//evil.com`, `/\evil.com`, `https:`).
 */
export function getSafeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  if (value.startsWith('/\\')) return undefined;
  return value;
}

export function loginUrlFor(path: string): string {
  return `/login?redirect=${encodeURIComponent(path)}`;
}
