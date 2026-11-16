import { logger, summarizeError } from '@/lib/logger';
import { describe, expect, it } from 'vitest';

describe('logger', { tags: ['backend'] }, () => {
  it('logs circular metadata (e.g. HTTP client errors) without throwing', () => {
    const error: Record<string, unknown> = { message: 'Midtrans 404' };
    error.self = error;

    expect(() => logger.warn('Could not expire', { error })).not.toThrow();
  });

  it('logs only name and message of an error, never its request', () => {
    const error = Object.assign(new Error('Midtrans 404'), {
      httpStatusCode: '404',
      rawHttpClientData: {
        request: { _currentUrl: 'https://SB-Mid-server-SECRET:@api.midtrans' },
      },
    });

    const logged = summarizeError(error);

    expect(logged).toEqual({
      name: 'Error',
      message: 'Midtrans 404',
      httpStatusCode: '404',
    });
    expect(JSON.stringify(logged)).not.toContain('SECRET');
  });
});
