import { logger } from '@/lib/logger';
import { describe, expect, it } from 'vitest';

describe('logger', { tags: ['backend'] }, () => {
  it('logs circular metadata (e.g. HTTP client errors) without throwing', () => {
    const error: Record<string, unknown> = { message: 'Midtrans 404' };
    error.self = error;

    expect(() => logger.warn('Could not expire', { error })).not.toThrow();
  });
});
