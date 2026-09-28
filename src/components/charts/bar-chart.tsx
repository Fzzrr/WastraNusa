'use client';

import { cn } from '@/lib/utils';

export type BarDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarDatum[];
  /** Formats the value shown on hover / above each bar. */
  valueFormatter?: (value: number) => string;
  /** CSS color for the bars. Defaults to the brand green. */
  color?: string;
  className?: string;
  /** Height of the plotting area in pixels. */
  height?: number;
  ariaLabel?: string;
};

/**
 * Dependency-free vertical bar chart built from CSS flex columns.
 *
 * Bars scale to the tallest value in the dataset. Rendered as accessible
 * markup (role="img") with per-bar labels and values below/above each column.
 */
export function BarChart({
  data,
  valueFormatter = (v) => String(v),
  color = 'var(--color-brand)',
  className,
  height = 200,
  ariaLabel = 'Bar chart',
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div
              key={d.label}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${d.label}: ${valueFormatter(d.value)}`}
            >
              <span className="text-muted-foreground text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
                {valueFormatter(d.value)}
              </span>
              <div
                className="w-full max-w-10 rounded-t-md transition-all"
                style={{
                  height: `${pct}%`,
                  minHeight: d.value > 0 ? 4 : 0,
                  backgroundColor: color,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="text-muted-foreground flex-1 text-center text-[11px]"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
