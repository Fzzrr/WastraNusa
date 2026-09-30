/**
 * Simple in-memory LRU/TTL cache for Chatbot Q&A.
 * 1. Article Context Cache: avoids repeated database hits and prompt formatting.
 * 2. Response Cache: avoids redundant LLM API calls for identical questions on the same article.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private map = new Map<string, CacheEntry<T>>();
  private readonly defaultTtlMs: number;
  private readonly maxEntries: number;

  constructor(defaultTtlMs = 10 * 60_000, maxEntries = 200) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxEntries = maxEntries;
  }

  public get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    // Refresh position for LRU
    this.map.delete(key);
    this.map.set(key, entry);

    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    if (this.map.size >= this.maxEntries) {
      // Evict oldest entry (first key in map iterator)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.map.set(key, { value, expiresAt });
  }

  public delete(key: string): void {
    this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }
}

// Global cache instances
// Article text cache: 10 minutes TTL
export const articleContextCache = new MemoryCache<string>(10 * 60_000, 100);

// Q&A reply cache: 30 minutes TTL
export const chatReplyCache = new MemoryCache<string>(30 * 60_000, 300);
