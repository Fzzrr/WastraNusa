'use client';

import { cn } from '@/lib/utils';
import { useId } from 'react';

export type AreaPoint = {
  label: string;
  value: number;
};

type AreaChartProps = {
  data: AreaPoint[];
  valueFormatter?: (value: number) => string;
  color?: string;
  className?: string;
  height?: number;
  ariaLabel?: string;
};

const VIEW_W = 600;
const PAD_X = 8;

/**
 * Dependency-free area + line chart drawn with an inline SVG path.
 *
 * The path is computed in a fixed viewBox and stretched responsively via
 * `preserveAspectRatio="none"`; x-axis labels are rendered as HTML below so
 * they stay legible at any width.
 */
export function AreaChart({
  data,
  valueFormatter = (v) => String(v),
  color = 'var(--color-brand)',
  className,
  height = 200,
  ariaLabel = 'Area chart',
}: AreaChartProps) {
  const gradientId = useId();
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;
  const innerW = VIEW_W - PAD_X * 2;

  const points = data.map((d, i) => {
    const x = n <= 1 ? VIEW_W / 2 : PAD_X + (innerW * i) / (n - 1);
    const y = height - (d.value / max) * (height - 12) - 6;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L ${points[0].x.toFixed(2)} ${height} Z`
      : '';

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${VIEW_W} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between gap-1">
        {data.map((d) => (
          <span
            key={d.label}
            className="text-muted-foreground flex-1 text-center text-[11px]"
            title={valueFormatter(d.value)}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
