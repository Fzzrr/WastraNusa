import { Reveal } from '@/components/reveal';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let trigger: ((entries: Array<{ isIntersecting: boolean }>) => void) | null =
  null;

class FakeIntersectionObserver {
  constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
    trigger = cb;
  }
  observe() {}
  disconnect() {}
}

function renderAt(top: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
  } as DOMRect);
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  const { container } = render(
    <Reveal>
      <p>Kartu</p>
    </Reveal>,
  );
  return container.firstElementChild as HTMLElement;
}

describe('Reveal', { tags: ['frontend'] }, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    trigger = null;
  });

  it('leaves content that is already on screen untouched', () => {
    const el = renderAt(100);

    expect(el.dataset.reveal).toBe('');
    expect(trigger).toBeNull();
  });

  it('holds content below the fold until it scrolls into view', () => {
    const el = renderAt(window.innerHeight + 500);
    expect(el.dataset.reveal).toBe('pending');

    act(() => trigger?.([{ isIntersecting: true }]));

    expect(el.dataset.reveal).toBe('shown');
  });
});
