import { MemoryCache } from '@/lib/gemini/cache';
import { describe, expect, it } from 'vitest';

describe('MemoryCache', () => {
  it('should store and retrieve cached values', () => {
    const cache = new MemoryCache<string>(10_000, 10);
    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should expire entries after TTL', async () => {
    const cache = new MemoryCache<string>(10, 10); // 10ms TTL
    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');

    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should evict oldest entry when capacity is reached', () => {
    const cache = new MemoryCache<string>(60_000, 2);
    cache.set('key1', 'val1');
    cache.set('key2', 'val2');
    cache.set('key3', 'val3'); // Should evict key1

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('val2');
    expect(cache.get('key3')).toBe('val3');
  });
});
