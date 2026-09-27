'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { AreaChart, HorizontalBarChart } from '@/components/charts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { authClient } from '@/lib/auth/auth-client';
import { cn, formatIDR } from '@/lib/utils';
import type { PopularArticle } from '@/types/dashboard';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Eye,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useSyncExternalStore } from 'react';

const surfaceCardClassName =
  'border-0 bg-[#fffdf9] shadow-[0_1px_0_rgba(60,41,15,0.06),0_18px_40px_rgba(89,69,38,0.05)] ring-1 ring-[#e8decd]';
const sectionHeaderClassName = 'border-b border-[#eee2d0] px-5 py-4';

function TrendBadge({ percent }: { percent: number }) {
  const positive = percent >= 0;
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-full border-0 px-2 py-0.5 text-[11px] shadow-none',
        positive ? 'text-[#5f865a]' : 'text-[#b45843]',
      )}
    >
      {positive ? (
        <ArrowUpRight data-icon="inline-start" />
      ) : (
        <ArrowDownRight data-icon="inline-start" />
      )}
      {`${positive ? '+' : ''}${percent.toFixed(1)}% vs bulan lalu`}
    </Badge>
  );
}

function StatCard({
  icon,
  value,
  label,
  footnote,
  trendPercent,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  footnote: string;
  trendPercent?: number | null;
}) {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f8f1e4] text-[#a98345] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {icon}
        </div>
        {typeof trendPercent === 'number' ? (
          <CardAction>
            <TrendBadge percent={trendPercent} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="px-5">
        <div className="text-3xl font-semibold tracking-tight text-[#30251d]">
          {value}
        </div>
        <p className="mt-2 text-sm font-medium text-[#50463b]">{label}</p>
        <p className="text-xs text-[#9b8f82]">{footnote}</p>
      </CardContent>
    </Card>
  );
}
// APPEND_MARKER

function TrafficCard({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const hasData = data.some((point) => point.value > 0);
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <TrendingUp className="text-[#a98345]" />
          Trafik Artikel
        </CardTitle>
        <p className="text-xs text-[#9a8e81]">
          Interaksi artikel 7 hari terakhir
        </p>
      </CardHeader>
      <CardContent className="px-5 py-5">
        {hasData ? (
          <AreaChart
            data={data}
            color="var(--color-brand)"
            height={200}
            ariaLabel="Trafik artikel 7 hari terakhir"
            valueFormatter={(value) => `${value} interaksi`}
          />
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-[#8f8377]">
            Belum ada interaksi artikel dalam 7 hari terakhir.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopSellerCard({
  data,
}: {
  data: Array<{ name: string; gmv: number; orderCount: number }>;
}) {
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <Store className="text-[#a98345]" />
          Top Seller
        </CardTitle>
        <p className="text-xs text-[#9a8e81]">
          Berdasarkan GMV (pesanan lunas)
        </p>
      </CardHeader>
      <CardContent className="px-5 py-5">
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[#8f8377]">
            Belum ada penjualan dari seller.
          </div>
        ) : (
          <HorizontalBarChart
            data={data.map((seller) => ({
              label: seller.name,
              value: seller.gmv,
              sublabel: `${seller.orderCount} pesanan`,
            }))}
            color="#C0653B"
            valueFormatter={formatIDR}
            ariaLabel="Top seller berdasarkan GMV"
          />
        )}
      </CardContent>
    </Card>
  );
}

function PopularArticlesCard({ articles }: { articles: PopularArticle[] }) {
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <BookOpen className="text-[#a98345]" />
          Artikel Paling Populer
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        {articles.length === 0 ? (
          <div className="py-6 text-sm text-[#8f8377]">
            Belum ada data artikel populer.
          </div>
        ) : (
          <div className="flex flex-col">
            {articles.map((article) => (
              <Link
                key={article.rank}
                href={`/encyclopedia/${article.slug}`}
                className="grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-[#f2e9dc] py-3 transition-colors last:border-b-0 hover:bg-[#fdf9f4]"
              >
                <div className="pt-0.5 text-sm font-semibold text-[#8c7f71]">
                  {article.rank}
                </div>
                <div>
                  <p className="font-medium text-[#41372c]">{article.title}</p>
                  <p className="text-xs text-[#9a8e81]">
                    {article.category} / {article.region}
                  </p>
                </div>
                <div className="flex items-center gap-3 whitespace-nowrap text-xs font-semibold text-[#6b6053]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                      <Eye className="size-3" />
                    </span>
                    {article.views.toLocaleString('id-ID')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#2f5f49]/10 text-[#2f5f49]">
                      <Clock3 className="size-3" />
                    </span>
                    {article.readTimeMinutes}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// SKELETON_MARKER

function StatCardSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <Skeleton className="size-10 rounded-2xl bg-[#eee2d0]" />
        <CardAction>
          <Skeleton className="h-5 w-24 rounded-full bg-[#eee2d0]" />
        </CardAction>
      </CardHeader>
      <CardContent className="px-5">
        <Skeleton className="h-9 w-32 bg-[#eee2d0]" />
        <Skeleton className="mt-2 h-5 w-28 bg-[#eee2d0]" />
        <Skeleton className="mt-1 h-4 w-36 bg-[#eee2d0]" />
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <Skeleton className="size-4 rounded-full bg-[#eee2d0]" />
          <Skeleton className="h-4 w-28 bg-[#eee2d0]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <Skeleton className="h-[200px] w-full rounded-lg bg-[#eee2d0]" />
      </CardContent>
    </Card>
  );
}

function buildHeaderSubtitle() {
  const now = new Date();
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekday = weekdays[now.getDay()];
  const month = months[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();

  return `WastraNusa Admin · ${weekday}, ${day} ${month} ${year}`;
}

// `false` during SSR and the first client render (so hydration matches), `true`
// on every render afterward — without a setState-in-effect. Lets us defer any
// timezone-dependent value to the client.
const subscribeNoop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function AdminDashboardContent() {
  const { data: session } = authClient.useSession();
  const { data, isLoading } = useAdminDashboard();

  // The subtitle embeds the current date, which depends on the viewer's
  // timezone — computing it during render would differ between the server (UTC)
  // and the browser and trip React's hydration check. Show a stable base until
  // hydrated, then the dated version (client-side only).
  const hydrated = useHydrated();
  const headerSubtitle = hydrated ? buildHeaderSubtitle() : 'WastraNusa Admin';
  const adminName = session?.user?.name ?? 'Admin WastraNusa';

  if (isLoading || !data) {
    return (
      <main className="flex flex-1 flex-col">
        <AdminHeader title="Dashboard Overview" subtitle={headerSubtitle} />
        <div className="flex flex-1 flex-col gap-6 px-4 py-5 md:px-8 md:py-7">
          <section className="grid gap-4 xl:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </section>
          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </section>
          <ChartCardSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <AdminHeader title="Dashboard Overview" subtitle={headerSubtitle} />
      <div className="flex flex-1 flex-col gap-6 px-4 py-5 md:px-8 md:py-7">
        <section className="grid gap-4 xl:grid-cols-3">
          <StatCard
            icon={<Wallet />}
            value={formatIDR(data.gmv.currentMonth)}
            label="GMV Bulan Ini"
            footnote={`Bulan lalu ${formatIDR(data.gmv.lastMonth)}`}
            trendPercent={data.gmv.changePercent}
          />
          <StatCard
            icon={<Users />}
            value={String(data.sellers.active)}
            label="Seller Aktif"
            footnote={`${data.sellers.active} dari ${data.sellers.registered} seller terdaftar`}
          />
          <StatCard
            icon={<Eye />}
            value={data.articleViews.total.toLocaleString('id-ID')}
            label="Kunjungan Artikel"
            footnote="Total kunjungan sepanjang waktu"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <TrafficCard data={data.articleTraffic} />
          <TopSellerCard data={data.topSellers} />
        </section>

        <PopularArticlesCard articles={data.popularArticles} />

        <div className="flex justify-end">
          <div className="hidden items-center gap-3 rounded-full bg-white/60 px-3 py-2 text-xs text-[#8d806f] shadow-[0_1px_0_rgba(60,41,15,0.04)] ring-1 ring-[#e8decd] md:flex">
            <Avatar size="sm" className="size-7">
              <AvatarFallback className="bg-[#ecd9ba] text-[#8b6b37]">
                {adminName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>Ringkasan data terakhir diperbarui hari ini</span>
          </div>
        </div>
      </div>
    </main>
  );
}
