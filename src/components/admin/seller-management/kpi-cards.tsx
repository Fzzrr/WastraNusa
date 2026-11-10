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
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[13px] font-medium',
        up ? 'bg-surface text-ink' : 'bg-destructive/10 text-destructive',
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
        'group rounded-xl p-5 ring-1',
        enterClassName,
        hoverLiftClassName,
        dark ? 'bg-field text-on-field ring-field' : lightCardClassName,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon
            className={cn(
              'size-5 shrink-0',
              dark ? 'text-gold' : 'text-ink-soft',
            )}
            strokeWidth={1.75}
          />
          <p
            className={cn(
              'text-[15px]',
              dark ? 'text-on-field-soft' : 'text-ink',
            )}
          >
            {label}
          </p>
        </div>
        {badge}
      </div>
      <p
        className={cn(
          'mt-3 text-4xl font-semibold tracking-[-0.02em] tabular-nums',
          dark ? 'text-on-field' : 'text-ink',
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
            className={cn('rounded-xl p-5 ring-1', lightCardClassName)}
          >
            <Skeleton className="h-3 w-32 bg-surface" />
            <Skeleton className="mt-3 h-8 w-24 bg-surface" />
            <Skeleton className="mt-4 h-[136px] w-full bg-surface" />
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
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[13px] font-medium text-white">
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
            <span className="ml-1.5 text-base font-medium text-ink-soft">
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
