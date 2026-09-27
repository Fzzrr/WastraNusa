import { COMMISSION_RATE } from '@/lib/constants';
import { describe, expect, it } from 'vitest';

/**
 * The seller feature computes admin commission and seller net revenue on the
 * fly from this single rate (no commission columns in the DB). These tests pin
 * the invariants the dashboards rely on.
 */
describe('COMMISSION_RATE', { tags: ['backend'] }, () => {
  it('is 15%', () => {
    expect(COMMISSION_RATE).toBe(0.15);
  });

  it('splits gross into net + commission that sum back to gross', () => {
    const gross = 1_000_000;
    const net = gross * (1 - COMMISSION_RATE);
    const commission = gross * COMMISSION_RATE;

    expect(net).toBe(850_000);
    expect(commission).toBe(150_000);
    expect(net + commission).toBe(gross);
  });

  it('yields zero split for zero gross', () => {
    const gross = 0;
    expect(gross * (1 - COMMISSION_RATE)).toBe(0);
    expect(gross * COMMISSION_RATE).toBe(0);
  });
});
