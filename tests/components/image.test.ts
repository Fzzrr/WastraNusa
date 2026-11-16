import { isRemoteUrl } from '@/components/ui/image';
import { describe, expect, it } from 'vitest';

describe('isRemoteUrl', { tags: ['frontend'] }, () => {
  it('skips the optimizer for remote images only', () => {
    expect(isRemoteUrl('https://upload.wikimedia.org/a.jpg')).toBe(true);
    expect(isRemoteUrl('http://example.com/b.png')).toBe(true);
    expect(isRemoteUrl('//cdn.example.com/c.png')).toBe(true);
    expect(isRemoteUrl('/auth-cover.jpg')).toBe(false);
  });
});
