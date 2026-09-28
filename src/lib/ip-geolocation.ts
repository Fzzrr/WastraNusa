import { logger } from '@/lib/logger';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 2000;

// ponytail: per-process in-memory cache; move to a shared store (e.g. a DB
// column filled at login) if this runs on many instances or lookups get heavy.
const cache = new Map<string, { city: string | null; expiresAt: number }>();

function normalizeIp(ip: string) {
  const trimmed = ip.trim().toLowerCase();
  return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
}

/** False for loopback, private, link-local and unspecified addresses. */
export function isPublicIp(rawIp: string) {
  const ip = normalizeIp(rawIp);

  if (ip.includes('.')) {
    const [a, b] = ip.split('.').map(Number);
    if ([a, b].some(Number.isNaN)) return false;
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  if (!ip.includes(':')) return false;
  if (/^[0:]+$/.test(ip) || ip === '::1') return false;
  return !/^(fc|fd|fe8|fe9|fea|feb)/.test(ip);
}

/** City (or null if unknown); undefined when the lookup itself failed. */
async function fetchCity(ip: string): Promise<string | null | undefined> {
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });
    const body = (await response.json()) as {
      success?: boolean;
      city?: string;
      region?: string;
    };
    if (!body.success) return null;
    return body.city?.trim() || body.region?.trim() || null;
  } catch (error) {
    logger.warn('IP geolocation lookup failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

/** Approximate city per IP (null when private, unknown, or lookup failed). */
export async function lookupCities(
  ips: Array<string | null | undefined>,
): Promise<Map<string, string | null>> {
  const now = Date.now();
  const unique = [...new Set(ips.filter((ip): ip is string => Boolean(ip)))];

  const entries = await Promise.all(
    unique.map(async (ip): Promise<[string, string | null]> => {
      if (!isPublicIp(ip)) return [ip, null];

      const key = normalizeIp(ip);
      const cached = cache.get(key);
      if (cached && cached.expiresAt > now) return [ip, cached.city];

      const city = await fetchCity(key);
      if (city === undefined) return [ip, null];
      cache.set(key, { city, expiresAt: now + CACHE_TTL_MS });
      return [ip, city];
    }),
  );

  return new Map(entries);
}
