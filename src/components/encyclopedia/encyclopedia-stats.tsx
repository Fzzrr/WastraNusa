'use client';

import type { Stat } from '@/types/encyclopedia';
import {
  BookOpen,
  Layers,
  type LucideIcon,
  Map,
  MapPin,
  Package,
} from 'lucide-react';
import { type CSSProperties, useEffect, useState } from 'react';

interface EncyclopediaStatsProps {
  stats: Stat[];
}

type StatStyle = {
  icon: LucideIcon;
  caption: string;
  /** Accent color (icon, number, bar). */
  color: string;
  /** Soft tint behind the icon and card. */
  tint: string;
};

const STAT_STYLES: Record<string, StatStyle> = {
  Artikel: {
    icon: BookOpen,
    caption: 'Tulisan terkurasi',
    color: '#2f5b49',
    tint: '#e3ece5',
  },
  Pulau: {
    icon: Map,
    caption: 'Gugusan nusantara',
    color: '#b8613f',
    tint: '#f6e4da',
  },
  Provinsi: {
    icon: MapPin,
    caption: 'Asal wastra',
    color: '#a07a2c',
    tint: '#f5ead3',
  },
  Wastra: {
    icon: Layers,
    caption: 'Jenis kain & pakaian',
    color: '#6b4f7a',
    tint: '#ece4f0',
  },
  // Katalog produk
  'Produk Autentik': {
    icon: Package,
    caption: 'Karya pengrajin lokal',
    color: '#2f5b49',
    tint: '#e3ece5',
  },
  'Pulau Asal': {
    icon: Map,
    caption: 'Sebaran asal produk',
    color: '#b8613f',
    tint: '#f6e4da',
  },
};

const FALLBACK_STYLE = STAT_STYLES.Artikel;

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

export function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const style = STAT_STYLES[stat.label] ?? FALLBACK_STYLE;
  const Icon = style.icon;
  const displayValue = useCountUp(stat.value);

  return (
    <div
      className="group relative animate-in overflow-hidden rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 ease-out fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-1 hover:bg-white/[0.11] hover:shadow-[0_18px_32px_-18px_rgba(0,0,0,0.6)] hover:ring-[#e8cb8d]/40"
      style={
        {
          '--stat-color': style.color,
          animationDelay: `${index * 90}ms`,
        } as CSSProperties
      }
    >
      {/* Soft corner glow in the accent tint */}
      <span
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 90% at 100% 0%, ${style.tint}33 0%, transparent 60%)`,
        }}
      />
      {/* Oversized faint icon as decoration */}
      <Icon
        className="pointer-events-none absolute -right-3 -bottom-4 size-20 opacity-[0.08] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
        style={{ color: style.tint }}
      />

      <div className="relative flex items-center gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl shadow-[0_8px_18px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]"
          style={{ backgroundColor: style.tint, color: style.color }}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="flex items-baseline gap-1.5">
            <span className="text-2xl leading-none font-extrabold tracking-tight text-white tabular-nums">
              {displayValue}
            </span>
            <span className="text-sm font-semibold whitespace-nowrap text-[#e4ece3]">
              {stat.label}
            </span>
          </p>
          <p className="mt-1 truncate text-xs text-[#a9c2b3]">
            {style.caption}
          </p>
        </div>
      </div>

      <span
        className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
        style={{ backgroundColor: style.tint }}
      />
    </div>
  );
}

export function EncyclopediaStats({ stats }: EncyclopediaStatsProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 md:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
}
