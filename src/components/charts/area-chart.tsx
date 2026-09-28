'use client';

import { cn } from '@/lib/utils';
import { type PointerEvent, useId, useState } from 'react';

import { niceTicks } from './scale';

export type AreaPoint = {
  label: string;
  value: number;
  /** Longer label for the hover tooltip; falls back to `label`. */
  tooltipLabel?: string;
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
const PAD_X = 4;

type Point = { x: number; y: number };

// Monotone cubic curve: smooth like the design, but never overshoots between
// points (so a flat/zero stretch can't dip below the axis).
function smoothPath(points: Point[]) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const slopes = points
    .slice(0, -1)
    .map((p, i) => (points[i + 1].y - p.y) / (points[i + 1].x - p.x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes[i - 1];
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });

  return points.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const dx = (p.x - prev.x) / 3;
    return `${path} C ${prev.x + dx} ${prev.y + tangents[i - 1] * dx} ${p.x - dx} ${p.y - tangents[i] * dx} ${p.x} ${p.y}`;
  }, '');
}

/**
 * Dependency-free smooth area chart with a y-axis and horizontal gridlines.
 *
 * Shapes are drawn in a fixed viewBox stretched via
 * `preserveAspectRatio="none"`; all text is HTML so it never distorts.
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
  const [active, setActive] = useState<number | null>(null);
  // Last hovered point stays rendered while fading out, so the marker glides
  // between points and fades instead of popping in/out.
  const [shown, setShown] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(0, ...data.map((d) => d.value)), {
    integer: data.every((d) => Number.isInteger(d.value)),
  });
  const axisMax = ticks[ticks.length - 1];
  const n = data.length;
  const innerW = VIEW_W - PAD_X * 2;
  const xAt = (i: number) =>
    n <= 1 ? VIEW_W / 2 : PAD_X + (innerW * i) / (n - 1);
  const yAt = (value: number) => height - (value / axisMax) * height;

  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));
  const linePath = smoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[n - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

  // Snap the pointer to the nearest data point.
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (n === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const index = n <= 1 ? 0 : Math.round(((viewX - PAD_X) / innerW) * (n - 1));
    const clamped = Math.min(n - 1, Math.max(0, index));
    setActive(clamped);
    setShown(clamped);
  };
  const shownPoint = shown === null ? null : points[shown];
  const markerTransition =
    'pointer-events-none absolute transition-[left,top,opacity] duration-300 ease-out';

  return (
    <div className={cn('flex w-full gap-3', className)}>
      <div className="relative w-6 shrink-0" style={{ height }}>
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute right-0 -translate-y-1/2 text-xs text-[#8a8378] tabular-nums"
            style={{ top: `${100 - (tick / axisMax) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="relative"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActive(null)}
        >
          <svg
            role="img"
            aria-label={ariaLabel}
            viewBox={`0 0 ${VIEW_W} ${height}`}
            preserveAspectRatio="none"
            className="w-full overflow-visible"
            style={{ height }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {ticks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={VIEW_W}
                y1={yAt(tick)}
                y2={yAt(tick)}
                stroke="#ebe6dd"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {shownPoint && shown !== null && (
            <>
              <span
                className={cn(
                  markerTransition,
                  'inset-y-0 w-0 border-l border-dashed',
                )}
                style={{
                  left: `${(shownPoint.x / VIEW_W) * 100}%`,
                  borderColor: color,
                  opacity: active === null ? 0 : 0.3,
                }}
              />
              <span
                className={cn(
                  markerTransition,
                  'size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm',
                )}
                style={{
                  left: `${(shownPoint.x / VIEW_W) * 100}%`,
                  top: shownPoint.y,
                  backgroundColor: color,
                  opacity: active === null ? 0 : 1,
                }}
              />
              <div
                className={cn(
                  markerTransition,
                  'z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-[#2f3a33] px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg',
                )}
                style={{
                  left: `${Math.min(92, Math.max(8, (shownPoint.x / VIEW_W) * 100))}%`,
                  top: shownPoint.y - 10,
                  opacity: active === null ? 0 : 1,
                }}
              >
                <p className="text-[11px] text-white/60">
                  {data[shown].tooltipLabel ?? data[shown].label}
                </p>
                <p className="font-semibold">
                  {valueFormatter(data[shown].value)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="relative mt-2 h-4">
          {data.map((d, i) => (
            <span
              key={d.label}
              className={cn(
                'absolute -translate-x-1/2 text-xs transition-colors',
                active === i
                  ? 'font-semibold text-[#2f4f3f]'
                  : 'text-[#6f6a62]',
              )}
              style={{ left: `${(xAt(i) / VIEW_W) * 100}%` }}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
