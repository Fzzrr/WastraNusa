import { isWikimediaUrl } from '@/components/ui/image';
import { describe, expect, it } from 'vitest';

describe('isWikimediaUrl', { tags: ['frontend'] }, () => {
  it('skips the optimizer only for Wikimedia images', () => {
    expect(
      isWikimediaUrl('https://upload.wikimedia.org/wikipedia/commons/a.jpg'),
    ).toBe(true);
    expect(
      isWikimediaUrl('https://thumb.wikimedia.org/wikipedia/commons/b.jpg'),
    ).toBe(true);
    expect(isWikimediaUrl('https://upload.wikimedia.org.evil.com/a.jpg')).toBe(
      false,
    );
    expect(isWikimediaUrl('/auth-cover.jpg')).toBe(false);
  });
});
