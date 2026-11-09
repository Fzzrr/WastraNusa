import { useModalPresence } from '@/hooks/use-modal-presence';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  document.body.style.overflow = '';
});

describe('useModalPresence', () => {
  it('locks scroll while open and unmounts after the exit animation', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ isOpen }) => useModalPresence(isOpen),
      { initialProps: { isOpen: true } },
    );

    expect(result.current).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });
    // Still mounted so the close animation can play.
    expect(result.current).toBe(true);
    expect(document.body.style.overflow).toBe('');

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(false);
  });

  it('starts unmounted when closed', () => {
    const { result } = renderHook(() => useModalPresence(false));
    expect(result.current).toBe(false);
  });
});
