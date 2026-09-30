/**
 * In-memory sliding-window rate limiter per identifier (IP / User ID).
 * Designed to prevent exhausting Gemini API Free Tier quota (typically 15 RPM).
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodic cleanup of expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      const interval = setInterval(() => this.cleanup(), 5 * 60_000);
      if (typeof interval === 'object' && 'unref' in interval) {
        (interval as { unref: () => void }).unref();
      }
    }
  }

  /**
   * Checks if an identifier is allowed to make a request.
   * If allowed, records the request timestamp.
   *
   * @param identifier Client IP or User ID
   * @returns { success: boolean; remaining: number; retryAfterSeconds?: number }
   */
  public check(identifier: string): {
    success: boolean;
    remaining: number;
    retryAfterSeconds?: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.records.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(identifier, record);
    }

    // Filter out timestamps outside current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.ceil(
        (oldestInWindow + this.windowMs - now) / 1000,
      );

      return {
        success: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    record.timestamps.push(now);

    return {
      success: true,
      remaining: this.maxRequests - record.timestamps.length,
    };
  }

  /**
   * Resets rate limit records (useful for testing).
   */
  public reset(): void {
    this.records.clear();
  }

  private cleanup(): void {
    const windowStart = Date.now() - this.windowMs;
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }
}

// Global singleton rate limiter: 10 requests per minute per IP
export const chatRateLimiter = new RateLimiter(10, 60_000);
