import { RateLimiter } from '@/lib/gemini/rate-limiter';
import { describe, expect, it } from 'vitest';

describe('RateLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = new RateLimiter(3, 60_000);

    const r1 = limiter.check('user-1');
    const r2 = limiter.check('user-1');
    const r3 = limiter.check('user-1');

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('should reject requests exceeding limit with retryAfterSeconds', () => {
    const limiter = new RateLimiter(2, 60_000);

    limiter.check('ip-1');
    limiter.check('ip-1');
    const exceeded = limiter.check('ip-1');

    expect(exceeded.success).toBe(false);
    expect(exceeded.remaining).toBe(0);
    expect(exceeded.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('should isolate limits between different identifiers', () => {
    const limiter = new RateLimiter(1, 60_000);

    const user1 = limiter.check('user-1');
    const user2 = limiter.check('user-2');

    expect(user1.success).toBe(true);
    expect(user2.success).toBe(true);

    const user1Second = limiter.check('user-1');
    expect(user1Second.success).toBe(false);
  });
});
