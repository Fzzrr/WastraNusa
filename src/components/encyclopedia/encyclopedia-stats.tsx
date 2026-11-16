'use client';

import type { Stat } from '@/types/encyclopedia';
import { useEffect, useState } from 'react';

interface EncyclopediaStatsProps {
  stats: Stat[];
  /** `dark` on the deep-green field, `light` on the page ground. */
  tone?: 'dark' | 'light';
}

// Animates 0 → target once; non-numeric values are shown as-is.
function useCountUp(value: string, durationMs = 900) {
  const target = Number.parseInt(value, 10);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    // Reduced motion: jump straight to the final value on the first frame.
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : durationMs;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setCurrent(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return Number.isFinite(target) ? current.toLocaleString('id-ID') : value;
}

/** A figure: the number large, one word under it. */
export function StatCard({
  stat,
  index,
  tone = 'dark',
}: {
  stat: Stat;
  index: number;
  tone?: 'dark' | 'light';
}) {
  const displayValue = useCountUp(stat.value);

  return (
    <div
      className="animate-in fill-mode-both fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <p
        className={`text-[clamp(2rem,3.4vw,2.75rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums ${tone === 'dark' ? 'text-on-field' : 'text-ink'}`}
      >
        {displayValue}
      </p>
      <p
        className={`mt-1.5 text-[15px] ${tone === 'dark' ? 'text-on-field-soft' : 'text-ink-soft'}`}
      >
        {stat.label.toLowerCase()}
      </p>
    </div>
  );
}

export function EncyclopediaStats({ stats, tone }: EncyclopediaStatsProps) {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} tone={tone} />
      ))}
    </div>
  );
}
