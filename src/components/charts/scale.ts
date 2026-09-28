/** Rounds an axis up to a readable max with ~`intervals` evenly spaced ticks. */
export function niceTicks(
  max: number,
  { intervals = 4, integer = false } = {},
): number[] {
  const safeMax = max > 0 ? max : 1;
  const rawStep = safeMax / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized =
    [1, 2, 4, 5, 10].find((candidate) => normalized <= candidate) ?? 10;
  const step = integer
    ? Math.max(1, niceNormalized * magnitude)
    : niceNormalized * magnitude;
  const niceMax = Math.ceil(safeMax / step) * step;

  return Array.from({ length: Math.round(niceMax / step) + 1 }, (_, index) =>
    Number((index * step).toFixed(10)),
  );
}
