'use client';

import { cn } from '@/lib/utils';

export type HBarDatum = {
  label: string;
  value: number;
  /** Optional secondary text shown under the label (e.g. category). */
  sublabel?: string;
};

type HorizontalBarChartProps = {
  data: HBarDatum[];
  valueFormatter?: (value: number) => string;
  color?: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * Ranked horizontal bar chart (e.g. "Top Seller"). Bars scale to the largest
 * value; each row shows a label, the proportional bar, and the formatted value.
 */
export function HorizontalBarChart({
  data,
  valueFormatter = (v) => String(v),
  color = 'var(--color-brand)',
  className,
  ariaLabel = 'Horizontal bar chart',
}: HorizontalBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('flex w-full flex-col gap-3', className)}
    >
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-foreground truncate text-sm font-medium">
                {d.label}
                {d.sublabel && (
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    · {d.sublabel}
                  </span>
                )}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs font-semibold tabular-nums">
                {valueFormatter(d.value)}
              </span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
