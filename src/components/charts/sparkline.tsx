'use client';

type TrendDirection = 'up' | 'down' | 'flat';

type SparklineProps = {
  data: number[];
  /** Overrides the auto-detected trend color. */
  direction?: TrendDirection;
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
};

const UP = 'var(--color-brand)';
const DOWN = 'oklch(0.6 0.2 25)';
const FLAT = 'var(--muted-foreground)';

function resolveDirection(data: number[]): TrendDirection {
  if (data.length < 2) return 'flat';
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'flat';
}

/**
 * Tiny inline trend line for table cells (the per-product "TREND" column).
 */
export function Sparkline({
  data,
  direction,
  width = 64,
  height = 20,
  className,
  ariaLabel = 'Trend',
}: SparklineProps) {
  const dir = direction ?? resolveDirection(data);
  const color = dir === 'up' ? UP : dir === 'down' ? DOWN : FLAT;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const n = data.length;

  const path = data
    .map((v, i) => {
      const x = n <= 1 ? width / 2 : (width * i) / (n - 1);
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
