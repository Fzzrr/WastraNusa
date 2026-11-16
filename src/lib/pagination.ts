// Largest page any list endpoint returns; stops `?limit=1000000` scans.
const MAX_PAGE_LIMIT = 50;
// Deepest page served; keeps OFFSET (page × limit) in a sane range.
const MAX_PAGE = 10_000;

/** A positive whole number from a query param, or `fallback`. */
function positiveInt(value: string | null, fallback: number, max: number) {
  // parseInt, not Number: "Infinity" and "1e15" must not slip through.
  const parsed = Number.parseInt(value ?? '', 10);
  return parsed >= 1 ? Math.min(parsed, max) : fallback;
}

/** Reads `?page=&limit=`; junk or out-of-range values fall back to safe ones. */
export function getPagination(
  source: Request | URLSearchParams,
  defaultLimit = 10,
) {
  const searchParams =
    source instanceof URLSearchParams
      ? source
      : new URL(source.url).searchParams;
  return {
    page: positiveInt(searchParams.get('page'), 1, MAX_PAGE),
    limit: positiveInt(searchParams.get('limit'), defaultLimit, MAX_PAGE_LIMIT),
  };
}
