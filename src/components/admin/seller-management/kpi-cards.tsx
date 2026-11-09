'use client';

import { KpiChart } from '@/components/charts';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellerManagementStats } from '@/hooks/use-seller-application';
import { cn, formatIDR } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  type LucideIcon,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { type ReactNode } from 'react';

import {
  enterClassName,
  hoverLiftClassName,
  lightCardClassName,
} from './styles';

const compactNumber = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const toJuta = (value: number) => value / 1_000_000;

const fromJuta = (value: number) => formatIDR(value * 1_000_000);

function ChangeBadge({ percent }: { percent: number | null }) {
  if (percent === null) return null;
  const up = percent >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
        up ? 'bg-[#e7efe4] text-[#3f6b4a]' : 'bg-[#f6e1dd] text-[#b04a3a]',
      )}
    >
      <Icon className="size-2.5" />
      {Math.abs(percent).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  badge,
  dark = false,
  delay = 0,
  children,
}: {
  icon: LucideIcon;
  delay?: number;
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'group rounded-2xl p-5 ring-1',
        enterClassName,
        hoverLiftClassName,
        dark
          ? 'bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-white ring-[#3a5a4a]'
          : lightCardClassName,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-lg transition-colors',
              dark
                ? 'bg-white/10 text-[#e8cb8d] group-hover:bg-[#e8cb8d] group-hover:text-[#2f4b3d]'
                : 'bg-[#f4efe5] text-[#8a6a3a] group-hover:bg-[#2f5543] group-hover:text-[#f4efe2]',
            )}
          >
            <Icon className="size-3.5" />
          </span>
          <p
            className={cn(
              'text-xs font-medium tracking-wider uppercase',
              dark ? 'text-white/80' : 'text-[#5f5a52]',
            )}
          >
            {label}
          </p>
        </div>
        {badge}
      </div>
      <p
        className={cn(
          'mt-3 text-3xl font-bold tracking-tight tabular-nums',
          dark ? 'text-white' : 'text-[#2a3a31]',
        )}
      >
        {value}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function KpiCards() {
  const { data, isLoading } = useSellerManagementStats();

  if (isLoading || !data) {
    return (
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn('rounded-2xl p-5 ring-1', lightCardClassName)}
          >
            <Skeleton className="h-3 w-32 bg-[#eee2d0]" />
            <Skeleton className="mt-3 h-8 w-24 bg-[#eee2d0]" />
            <Skeleton className="mt-4 h-[136px] w-full bg-[#eee2d0]" />
          </div>
        ))}
      </section>
    );
  }

  const { months, verifiedSellers, monthlySales, annualRevenue, orders } = data;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <KpiCard
        dark
        icon={BadgeCheck}
        label="Seller Terverifikasi"
        value={verifiedSellers.total.toLocaleString('id-ID')}
        badge={
          verifiedSellers.newThisMonth > 0 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white">
              <ArrowUp className="size-2.5" />
              {verifiedSellers.newThisMonth} Baru
            </span>
          ) : null
        }
      >
        <KpiChart
          type="bar"
          tone="dark"
          labels={months}
          values={verifiedSellers.series}
          color="#7f8b62"
          highlightColor="#e8cb8d"
          tickFormatter={(v) => Math.round(v).toLocaleString('id-ID')}
          ariaLabel="Jumlah seller terverifikasi per bulan"
        />
      </KpiCard>

      <KpiCard
        icon={TrendingUp}
        delay={80}
        label="Penjualan Bulan Ini"
        value={`${compactNumber.format(monthlySales.current)}`}
        badge={<ChangeBadge percent={monthlySales.changePercent} />}
      >
        <KpiChart
          type="line"
          labels={months}
          values={monthlySales.series.map(toJuta)}
          color="#b8613f"
          valueFormatter={fromJuta}
          ariaLabel="Penjualan per bulan (juta rupiah)"
        />
      </KpiCard>

      <KpiCard
        icon={Wallet}
        delay={160}
        label="Revenue Tahunan"
        value={`${compactNumber.format(annualRevenue.current)}`}
        badge={<ChangeBadge percent={annualRevenue.changePercent} />}
      >
        <KpiChart
          type="line"
          labels={months}
          values={annualRevenue.series.map(toJuta)}
          color="#c0a06a"
          valueFormatter={fromJuta}
          ariaLabel="Revenue 12 bulan terakhir (juta rupiah)"
        />
      </KpiCard>

      <KpiCard
        icon={Receipt}
        delay={240}
        label="Total Penjualan"
        value={
          <>
            {orders.current.toLocaleString('id-ID')}
            <span className="ml-1.5 text-base font-medium text-[#9a8f80]">
              Transaksi
            </span>
          </>
        }
        badge={<ChangeBadge percent={orders.changePercent} />}
      >
        <KpiChart
          type="bar"
          labels={months}
          values={orders.series}
          color="#c9bfb6"
          tickFormatter={(v) => Math.round(v).toLocaleString('id-ID')}
          ariaLabel="Jumlah transaksi per bulan"
        />
      </KpiCard>
    </section>
  );
}
