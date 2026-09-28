'use client';

import { cn } from '@/lib/utils';
import { type PointerEvent, useId, useState } from 'react';

type KpiChartProps = {
  labels: string[];
  values: number[];
  type: 'bar' | 'line';
  color: string;
  /** Bar charts only: color of the last (current) bar. */
  highlightColor?: string;
  /** `dark` for charts drawn on a dark card. */
  tone?: 'light' | 'dark';
  tickFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  height?: number;
  ariaLabel: string;
};

// Axis spans the data range (bars get headroom below the smallest value so it
// stays visible), matching the compact KPI-card design.
function axisRange(values: number[], type: 'bar' | 'line') {
  const max = Math.max(0, ...values);
  const min = Math.min(max, ...values);
  const lo = type === 'bar' ? Math.max(0, min - (max - min) / 4) : min;
  if (max - lo > 0) return { lo, hi: max };
  return { lo: type === 'bar' ? 0 : Math.max(0, max - 1), hi: max || 1 };
}

/** Small bar/line chart with a 3-tick y-axis for KPI cards. */
export function KpiChart({
  labels,
  values,
  type,
  color,
  highlightColor,
  tone = 'light',
  tickFormatter = (v) =>
    v.toLocaleString('id-ID', { maximumFractionDigits: 1 }),
  valueFormatter = tickFormatter,
  height = 116,
  ariaLabel,
}: KpiChartProps) {
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);
  // Last hovered index stays rendered while fading out (smooth hover).
  const [shown, setShown] = useState<number | null>(null);
  const { lo, hi } = axisRange(values, type);
  const ticks = [lo, (lo + hi) / 2, hi];
  const fraction = (value: number) => (value - lo) / (hi - lo);
  const xFraction = (i: number) =>
    values.length <= 1 ? 0.5 : i / (values.length - 1);
  const isDark = tone === 'dark';
  const n = values.length;
  // Horizontal center of point/bar `i`, as a fraction of the plot width.
  const centerFraction = (i: number) =>
    type === 'bar' ? (i + 0.5) / n : xFraction(i);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (n === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const index = type === 'bar' ? Math.floor(x * n) : Math.round(x * (n - 1));
    const clamped = Math.min(n - 1, Math.max(0, index));
    setActive(clamped);
    setShown(clamped);
  };

  const linePoints = values
    .map((v, i) => `${xFraction(i) * 100},${(1 - fraction(v)) * 100}`)
    .join(' ');

  return (
    <div role="img" aria-label={ariaLabel} className="flex gap-2">
      <div className="relative w-8 shrink-0" style={{ height }}>
        {ticks.map((tick) => (
          <span
            key={tick}
            className={cn(
              'absolute right-0 -translate-y-1/2 text-[10px] tabular-nums',
              isDark ? 'text-white/60' : 'text-[#9a948a]',
            )}
            style={{ top: `${(1 - fraction(tick)) * 100}%` }}
          >
            {tickFormatter(tick)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="relative"
          style={{ height }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className={cn(
                'absolute inset-x-0 h-px',
                isDark ? 'bg-white/10' : 'bg-[#efe9df]',
              )}
              style={{ top: `${(1 - fraction(tick)) * 100}%` }}
            />
          ))}

          {type === 'bar' ? (
            <div className="absolute inset-0 flex items-end gap-2">
              {values.map((v, i) => (
                <div
                  key={labels[i]}
                  className={cn(
                    'flex-1 rounded-t-sm transition-opacity duration-300',
                    active !== null && active !== i && 'opacity-40',
                  )}
                  style={{
                    height: `${fraction(v) * 100}%`,
                    backgroundColor:
                      i === values.length - 1 && highlightColor
                        ? highlightColor
                        : color,
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,100 ${linePoints} 100,100`}
                  fill={`url(#${gradientId})`}
                />
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              </svg>
              {values.map((v, i) => (
                <span
                  key={labels[i]}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-white transition-all duration-300',
                    active === i
                      ? 'size-3 ring-2'
                      : i === values.length - 1
                        ? 'size-2.5'
                        : 'size-1.5',
                  )}
                  style={{
                    left: `${xFraction(i) * 100}%`,
                    top: `${(1 - fraction(v)) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              ))}
            </>
          )}

          {shown !== null && shown < n ? (
            <div
              className={cn(
                'pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg transition-[left,top,opacity] duration-300 ease-out',
                isDark
                  ? 'bg-[#fffdfa] text-[#2f3a33]'
                  : 'bg-[#2f3a33] text-white',
              )}
              style={{
                left: `${Math.min(85, Math.max(15, centerFraction(shown) * 100))}%`,
                top: `calc(${(1 - fraction(values[shown])) * 100}% - 8px)`,
                opacity: active === null ? 0 : 1,
              }}
            >
              <p
                className={cn(
                  'text-[10px]',
                  isDark ? 'text-[#9a8f80]' : 'text-white/60',
                )}
              >
                {labels[shown]}
              </p>
              <p className="font-semibold">{valueFormatter(values[shown])}</p>
            </div>
          ) : null}
        </div>

        <div
          className={cn('relative mt-1.5 flex h-4', type === 'bar' && 'gap-2')}
        >
          {labels.map((label, i) =>
            type === 'bar' ? (
              <span
                key={label}
                className={cn(
                  'flex-1 text-center text-[10px] transition-colors',
                  active === i
                    ? isDark
                      ? 'font-semibold text-white'
                      : 'font-semibold text-[#2f4f3f]'
                    : isDark
                      ? 'text-white/60'
                      : 'text-[#9a948a]',
                )}
              >
                {label}
              </span>
            ) : (
              <span
                key={label}
                className={cn(
                  'absolute -translate-x-1/2 text-[10px] transition-colors',
                  active === i
                    ? 'font-semibold text-[#2f4f3f]'
                    : 'text-[#9a948a]',
                )}
                style={{ left: `${xFraction(i) * 100}%` }}
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
