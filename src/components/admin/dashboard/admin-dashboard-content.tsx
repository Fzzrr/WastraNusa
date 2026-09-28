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
  'rounded-2xl bg-[#fffdfa] p-6 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6] animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both';
const hoverLiftClassName =
  'transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(60,41,15,0.05),0_18px_40px_rgba(89,69,38,0.12)]';

const compactNumber = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

type BadgeTone = 'green' | 'blue' | 'peach' | 'red';

const badgeToneClassName: Record<BadgeTone, string> = {
  green: 'bg-[#e7efe4] text-[#3f6b4a]',
  blue: 'bg-[#e6ecf3] text-[#34507a]',
  peach: 'bg-[#f6e7de] text-[#a15d3b]',
  red: 'bg-[#f6e1dd] text-[#b04a3a]',
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
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
  footnoteClassName = 'text-[#9a8f80]',
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
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#f4efe5] text-[#8a6a3a] transition-colors group-hover:bg-[#2f5543] group-hover:text-[#f4efe2]">
            <Icon className="size-4" />
          </span>
          <p className="text-sm text-[#5f5a52]">{label}</p>
        </div>
        {badge}
      </div>
      <p className="mt-5 text-4xl font-bold tracking-tight text-[#2f4f3f] tabular-nums">
        {value}
      </p>
      <p className={cn('mt-3 text-xs', footnoteClassName)}>{footnote}</p>
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
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2f4f3f]">
          <span className="h-4 w-1 rounded-full bg-[#d2a36d]" />
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 pl-3 text-sm text-[#9a8f80]">{subtitle}</p>
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
    <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#e6dccb] bg-[#faf7f2] text-sm text-[#8f8377]">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#f4efe5] text-[#b08a5e]">
        <Icon className="size-5" />
      </span>
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
        label="GMV Bulan Ini"
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
        label="Seller Aktif"
        value={data.sellers.active.toLocaleString('id-ID')}
        footnote={`dari ${data.sellers.registered.toLocaleString('id-ID')} seller terdaftar`}
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
        footnoteClassName="text-[#b08a5e]"
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
        subtitle="Total Interaksi"
        aside={
          <span className="rounded-full bg-[#f4efe5] px-2.5 py-1 text-xs font-medium text-[#6f6a62]">
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
        title="Top Seller"
        subtitle="Penjualan (Juta Rupiah)"
        aside={
          <span className="rounded-full bg-[#f4efe5] px-2.5 py-1 text-xs font-medium text-[#6f6a62]">
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
            className="group/link inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-[#a07a3a] transition-colors hover:bg-[#f4efe5]"
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
              className="group grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 rounded-xl border-b border-[#efe8dd] px-3 py-3 transition-colors last:border-b-0 hover:bg-[#f7f2ea]"
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                  article.rank <= 3
                    ? 'bg-[#f5ead3] text-[#b8923f]'
                    : 'bg-[#f1ede6] text-[#6b665e]',
                )}
              >
                {article.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-[#2f3a33] transition-colors group-hover:text-[#2f5543]">
                  {article.title}
                </p>
                <p className="text-xs text-[#9a8f80]">{article.category}</p>
              </div>
              <div className="flex items-center gap-2 text-xs whitespace-nowrap text-[#6b665e]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f4efe5] px-2 py-1">
                  <Eye className="size-3.5" />
                  {article.views.toLocaleString('id-ID')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f4efe5] px-2 py-1">
                  <Clock3 className="size-3.5" />
                  {article.readTimeMinutes} Mnt
                </span>
                <ArrowRight className="size-3.5 -translate-x-1 text-[#a07a3a] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
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
            <Skeleton className="h-4 w-28 bg-[#eee2d0]" />
            <Skeleton className="mt-5 h-10 w-36 bg-[#eee2d0]" />
            <Skeleton className="mt-3 h-3 w-40 bg-[#eee2d0]" />
          </div>
        ))}
      </section>
      <div className={cardClassName}>
        <Skeleton className="h-5 w-32 bg-[#eee2d0]" />
        <Skeleton className="mt-6 h-[190px] w-full bg-[#eee2d0]" />
      </div>
      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className={cardClassName}>
            <Skeleton className="h-5 w-32 bg-[#eee2d0]" />
            <Skeleton className="mt-6 h-[220px] w-full bg-[#eee2d0]" />
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
    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
      <AdminBrandChip />
      {hydrated ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffdfa] px-3 py-1 text-[#6f6a62] ring-1 ring-[#ebe3d6]">
          <CalendarDays className="size-3.5 text-[#b08a5e]" />
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
        title="Dashboard Overview"
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
