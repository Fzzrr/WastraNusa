import { formatShortTime } from '@/components/chat/chat-format';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('formatShortTime', { tags: ['frontend'] }, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows older dates as "19 Okt 2026", like order dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 12));

    expect(formatShortTime(new Date(2026, 9, 19, 9).toISOString())).toBe(
      '19 Okt 2026',
    );
  });

  it('shows "Kemarin" for yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 12));

    expect(formatShortTime(new Date(2026, 10, 2, 9).toISOString())).toBe(
      'Kemarin',
    );
  });
});
