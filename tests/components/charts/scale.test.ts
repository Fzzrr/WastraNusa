import { niceTicks } from '@/components/charts/scale';
import { describe, expect, it } from 'vitest';

describe('niceTicks', { tags: ['frontend'] }, () => {
  it('rounds the axis up to readable steps', () => {
    expect(niceTicks(7.5)).toEqual([0, 2, 4, 6, 8]);
    expect(niceTicks(140)).toEqual([0, 40, 80, 120, 160]);
  });

  it('keeps integer axes whole and handles empty data', () => {
    expect(niceTicks(1, { integer: true })).toEqual([0, 1]);
    expect(niceTicks(0, { integer: true })).toEqual([0, 1]);
  });
});
