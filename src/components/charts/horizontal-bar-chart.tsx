'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

import { niceTicks } from './scale';

export type HBarDatum = {
  label: string;
  value: number;
};

type HorizontalBarChartProps = {
  data: HBarDatum[];
  /** Tooltip text for a bar. */
  valueFormatter?: (value: number) => string;
  /** One color per row, cycled if there are more rows than colors. */
  colors?: string[];
  className?: string;
  ariaLabel?: string;
};

const DEFAULT_COLORS = ['#2f4f3f', '#5b7d66', '#8a6a2a', '#a5694a', '#c2a57a'];

/**
 * Ranked horizontal bar chart (e.g. "Top Seller"): labels on the left, bars
 * scaled to a rounded axis with vertical gridlines and tick values below.
 */
export function HorizontalBarChart({
  data,
  valueFormatter = (v) => String(v),
  colors = DEFAULT_COLORS,
  className,
  ariaLabel = 'Horizontal bar chart',
}: HorizontalBarChartProps) {
  const ticks = niceTicks(Math.max(0, ...data.map((d) => d.value)));
  const axisMax = ticks[ticks.length - 1];
  const toPercent = (value: number) => (value / axisMax) * 100;
  const [active, setActive] = useState<number | null>(null);
  const dimmed = (i: number) => active !== null && active !== i;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('grid grid-cols-[88px_1fr] gap-x-3', className)}
    >
      <div className="flex flex-col">
        {data.map((d, i) => (
          <span
            key={`${d.label}-${i}`}
            className={cn(
              'flex h-11 items-center justify-end text-right text-xs leading-tight transition-colors',
              active === i
                ? 'font-semibold text-[#2f4f3f]'
                : dimmed(i)
                  ? 'text-[#a9a298]'
                  : 'text-[#4a4843]',
            )}
          >
            {d.label}
          </span>
        ))}
      </div>

      <div className="relative">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute inset-y-0 w-px bg-[#efeae2]"
            style={{ left: `${toPercent(tick)}%` }}
          />
        ))}
        {data.map((d, i) => (
          <div
            key={`${d.label}-${i}`}
            className="relative flex h-11 cursor-default items-center"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
          >
            <div
              className={cn(
                'h-5 origin-left rounded-full transition-all duration-300',
                active === i && 'h-6 shadow-md',
                dimmed(i) && 'opacity-35',
              )}
              style={{
                width: `${Math.max(toPercent(d.value), 1)}%`,
                backgroundColor: colors[i % colors.length],
              }}
            />
            {active === i && (
              <span
                className="pointer-events-none absolute z-10 ml-2 rounded-md bg-[#2f3a33] px-2 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg"
                style={{
                  left: `${Math.min(toPercent(d.value), 70)}%`,
                }}
              >
                {valueFormatter(d.value)}
              </span>
            )}
          </div>
        ))}
      </div>

      <span />
      <div className="relative mt-2 h-4">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 text-xs text-[#6f6a62] tabular-nums"
            style={{ left: `${toPercent(tick)}%` }}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}
