import { getPagination } from '@/lib/pagination';
import { describe, expect, it } from 'vitest';

const p = (qs: string) => getPagination(new URLSearchParams(qs));

describe('getPagination', { tags: ['backend'] }, () => {
  it('clamps junk and extreme values', () => {
    expect(p('')).toEqual({ page: 1, limit: 10 });
    expect(p('page=Infinity&limit=abc')).toEqual({ page: 1, limit: 10 });
    expect(p('page=1e15&limit=1000000')).toEqual({ page: 1, limit: 50 });
    expect(p('page=99999999&limit=0')).toEqual({ page: 10_000, limit: 10 });
    expect(p('page=3&limit=5')).toEqual({ page: 3, limit: 5 });
  });

  it('reads the query of a Request', () => {
    const req = new Request('http://localhost/api/x?page=2&limit=7');
    expect(getPagination(req, 5)).toEqual({ page: 2, limit: 7 });
  });
});
