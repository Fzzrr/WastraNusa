import { isPublicIp, lookupCities } from '@/lib/ip-geolocation';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('isPublicIp', { tags: ['backend'] }, () => {
  it('rejects loopback, private and unspecified addresses', () => {
    for (const ip of [
      '127.0.0.1',
      '10.1.2.3',
      '192.168.1.5',
      '172.20.0.1',
      '::1',
      '0000:0000:0000:0000:0000:0000:0000:0000',
      'fd12::1',
      '::ffff:192.168.0.2',
    ]) {
      expect(isPublicIp(ip)).toBe(false);
    }
  });

  it('accepts public addresses', () => {
    expect(isPublicIp('36.72.10.5')).toBe(true);
    expect(isPublicIp('::ffff:36.72.10.5')).toBe(true);
    expect(isPublicIp('2001:4860:4860::8888')).toBe(true);
  });
});

describe('lookupCities', { tags: ['backend'] }, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves public IPs once and skips private ones', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, city: 'Bandung' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await lookupCities(['36.72.10.99', '127.0.0.1', null]);
    const second = await lookupCities(['36.72.10.99']);

    expect(first.get('36.72.10.99')).toBe('Bandung');
    expect(first.get('127.0.0.1')).toBeNull();
    expect(second.get('36.72.10.99')).toBe('Bandung');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not cache failed lookups', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue({
        json: async () => ({ success: true, city: 'Medan' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const failed = await lookupCities(['36.72.10.77']);
    const retried = await lookupCities(['36.72.10.77']);

    expect(failed.get('36.72.10.77')).toBeNull();
    expect(retried.get('36.72.10.77')).toBe('Medan');
  });
});
