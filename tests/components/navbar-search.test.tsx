import { NavbarSearch } from '@/components/navbar-search';
import { useArticles } from '@/hooks/use-article';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/use-article', () => ({ useArticles: vi.fn() }));
vi.mock('@/hooks/use-product-catalog', () => ({
  useProductCatalog: vi.fn(),
}));

const idle = { data: undefined, isFetching: false } as never;

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useArticles).mockReturnValue(idle);
  vi.mocked(useProductCatalog).mockReturnValue(idle);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NavbarSearch', { tags: ['frontend'] }, () => {
  it('does not fetch until the user types, then sends the query to the API', () => {
    render(<NavbarSearch />);

    // Mounted in every page header: nothing may be fetched up front.
    expect(vi.mocked(useProductCatalog).mock.lastCall?.[3]).toEqual({
      enabled: false,
    });
    expect(vi.mocked(useArticles).mock.lastCall?.[3]).toEqual({
      enabled: false,
    });

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: ' batik ' },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useProductCatalog).mock.lastCall?.slice(2)).toEqual([
      { q: 'batik' },
      { enabled: true },
    ]);
    expect(vi.mocked(useArticles).mock.lastCall?.slice(2)).toEqual([
      { q: 'batik' },
      { enabled: true },
    ]);
  });
});
