'use client';

import { AdminBrandChip, AdminHeader } from '@/components/admin/admin-header';
import { AreaChart, HorizontalBarChart } from '@/components/charts';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type AdminDashboardData,
  useAdminDashboard,
} from '@/hooks/use-admin-dashboard';
import { cn, formatIDR } from '@/lib/utils';
import type { PopularArticle } from '@/types/dashboard';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChartNoAxesColumn,
  Clock3,
  Eye,
  type LucideIcon,
  Store,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useSyncExternalStore } from 'react';

const cardClassName =
  'rounded-xl bg-card p-6 ring-1 ring-border animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both';
const hoverLiftClassName = 'transition-[translate,box-shadow] duration-300';

const compactNumber = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

type BadgeTone = 'green' | 'blue' | 'peach' | 'red';

const badgeToneClassName: Record<BadgeTone, string> = {
  green: 'bg-surface text-ink',
  blue: 'bg-[#e6ecf3] text-[#34507a]',
  peach: 'bg-surface text-destructive',
  red: 'bg-destructive/10 text-destructive',
};

function TrendBadge({
  children,
  tone,
  down = false,
}: {
  children: ReactNode;
  tone: BadgeTone;
  down?: boolean;
}) {
  const Icon = down ? ArrowDown : ArrowUp;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium',
        badgeToneClassName[tone],
      )}
    >
      <Icon className="size-3" />
      {children}
    </span>
  );
}

function formatPercent(percent: number) {
  return `${percent >= 0 ? '+' : ''}${percent.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  footnote,
  badge,
  footnoteClassName = 'text-ink-soft',
  delay = 0,
}: {
  icon: LucideIcon;
  delay?: number;
  label: string;
  value: string;
  footnote: string;
  badge?: ReactNode;
  footnoteClassName?: string;
}) {
  return (
    <div
      className={cn(cardClassName, hoverLiftClassName, 'group')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className="shrink-0 size-5 text-ink-soft" strokeWidth={1.75} />
          <p className="text-base text-ink">{label}</p>
        </div>
        {badge}
      </div>
      <p className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-ink tabular-nums">
        {value}
      </p>
      <p className={cn('mt-3 text-[15px]', footnoteClassName)}>{footnote}</p>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {aside}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-xl bg-surface text-[15px] text-ink-soft">
      <Icon className="shrink-0 size-5 text-ink-soft" strokeWidth={1.75} />
      {children}
    </div>
  );
}

function StatCards({ data }: { data: AdminDashboardData }) {
  const gmvChange = data.gmv.changePercent;

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <StatCard
        icon={Wallet}
        label="Total Transaksi Bulan Ini"
        value={`Rp ${compactNumber.format(data.gmv.currentMonth)}`}
        footnote="Total transaksi seluruh seller"
        badge={
          typeof gmvChange === 'number' ? (
            <TrendBadge
              tone={gmvChange >= 0 ? 'green' : 'red'}
              down={gmvChange < 0}
            >
              {formatPercent(gmvChange)}
            </TrendBadge>
          ) : null
        }
      />
      <StatCard
        icon={Store}
        delay={80}
        label="Penjual Aktif"
        value={data.sellers.active.toLocaleString('id-ID')}
        footnote={`dari ${data.sellers.registered.toLocaleString('id-ID')} penjual terdaftar`}
        badge={
          data.sellers.newThisMonth > 0 ? (
            <TrendBadge tone="blue">+{data.sellers.newThisMonth}</TrendBadge>
          ) : null
        }
      />
      <StatCard
        icon={Eye}
        delay={160}
        label="Kunjungan Artikel"
        value={compactNumber.format(data.articleViews.total)}
        footnote="Total kunjungan seluruh artikel"
        footnoteClassName="text-ink-soft"
      />
    </section>
  );
}

const WEEKDAY_FULL_ID: Record<string, string> = {
  Min: 'Minggu',
  Sen: 'Senin',
  Sel: 'Selasa',
  Rab: 'Rabu',
  Kam: 'Kamis',
  Jum: 'Jumat',
  Sab: 'Sabtu',
};

function TrafficCard({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <section
      className={cn(cardClassName, hoverLiftClassName)}
      style={{ animationDelay: '200ms' }}
    >
      <SectionHeader
        title="Trafik Artikel"
        subtitle="Total interaksi"
        aside={
          <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-medium text-ink-soft">
            7 Hari
          </span>
        }
      />
      <div className="mt-6">
        {hasData ? (
          <AreaChart
            data={data.map((point) => ({
              ...point,
              tooltipLabel: WEEKDAY_FULL_ID[point.label],
            }))}
            color="#2f5543"
            height={190}
            ariaLabel="Trafik artikel 7 hari terakhir"
            valueFormatter={(value) =>
              `${value.toLocaleString('id-ID')} Interaksi`
            }
          />
        ) : (
          <EmptyState icon={TrendingUp}>
            Belum ada interaksi artikel dalam 7 hari terakhir.
          </EmptyState>
        )}
      </div>
    </section>
  );
}

function TopSellerCard({
  data,
}: {
  data: Array<{ name: string; gmv: number }>;
}) {
  return (
    <section
      className={cn(cardClassName, hoverLiftClassName)}
      style={{ animationDelay: '280ms' }}
    >
      <SectionHeader
        title="Penjual Teratas"
        subtitle="Penjualan (juta rupiah)"
        aside={
          <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-medium text-ink-soft">
            Bulan Ini
          </span>
        }
      />
      <div className="mt-5">
        {data.length === 0 ? (
          <EmptyState icon={ChartNoAxesColumn}>
            Belum ada penjualan seller bulan ini.
          </EmptyState>
        ) : (
          <HorizontalBarChart
            data={data.map((seller) => ({
              label: seller.name,
              value: seller.gmv / 1_000_000,
            }))}
            valueFormatter={(value) => formatIDR(value * 1_000_000)}
            ariaLabel="Top seller berdasarkan penjualan bulan ini"
          />
        )}
      </div>
    </section>
  );
}

function PopularArticlesCard({ articles }: { articles: PopularArticle[] }) {
  return (
    <section
      className={cn(cardClassName, hoverLiftClassName)}
      style={{ animationDelay: '360ms' }}
    >
      <SectionHeader
        title="Artikel Paling Populer"
        aside={
          <Link
            href="/admin/article"
            className="group/link inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[15px] text-ink-soft transition-colors hover:bg-surface"
          >
            Lihat Semua
            <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        }
      />
      <div className="-mx-3 mt-4">
        {articles.length === 0 ? (
          <EmptyState icon={Eye}>Belum ada data artikel populer.</EmptyState>
        ) : (
          articles.map((article) => (
            <Link
              key={article.rank}
              href={`/encyclopedia/${article.slug}`}
              className="group grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 rounded-xl border-b border-border px-3 py-3 transition-colors last:border-b-0 hover:bg-surface"
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-[15px] font-semibold',
                  article.rank <= 3
                    ? 'bg-surface text-ink-soft'
                    : 'bg-surface text-ink-soft',
                )}
              >
                {article.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink transition-colors group-hover:text-ink">
                  {article.title}
                </p>
                <p className="text-[13px] text-ink-soft">{article.category}</p>
              </div>
              <div className="flex items-center gap-2 text-[13px] whitespace-nowrap text-ink-soft">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1">
                  <Eye className="size-3.5" />
                  {article.views.toLocaleString('id-ID')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1">
                  <Clock3 className="size-3.5" />
                  {article.readTimeMinutes} Mnt
                </span>
                <ArrowRight className="size-3.5 -translate-x-1 text-ink-soft opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={cardClassName}>
            <Skeleton className="h-4 w-28 bg-surface" />
            <Skeleton className="mt-5 h-10 w-36 bg-surface" />
            <Skeleton className="mt-3 h-3 w-40 bg-surface" />
          </div>
        ))}
      </section>
      <div className={cardClassName}>
        <Skeleton className="h-5 w-32 bg-surface" />
        <Skeleton className="mt-6 h-[190px] w-full bg-surface" />
      </div>
      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className={cardClassName}>
            <Skeleton className="h-5 w-32 bg-surface" />
            <Skeleton className="mt-6 h-[220px] w-full bg-surface" />
          </div>
        ))}
      </section>
    </>
  );
}

// `false` during SSR and the first client render (so hydration matches), `true`
// afterward — the dated subtitle depends on the viewer's timezone.
const subscribeNoop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function AdminDashboardContent() {
  const { data, isLoading } = useAdminDashboard();
  const hydrated = useHydrated();
  const headerSubtitle = (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-[15px]">
      <AdminBrandChip />
      {hydrated ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-ink-soft ring-1 ring-border">
          <CalendarDays className="size-3.5 text-ink-soft" />
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      ) : null}
    </div>
  );

  return (
    <main className="flex flex-1 flex-col">
      <AdminHeader
        title="Ringkasan Dasbor"
        subtitle={headerSubtitle}
        variant="plain"
      />
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <StatCards data={data} />
            <TrafficCard data={data.articleTraffic} />
            <section className="grid gap-6 xl:grid-cols-2">
              <TopSellerCard data={data.topSellers} />
              <PopularArticlesCard articles={data.popularArticles} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
