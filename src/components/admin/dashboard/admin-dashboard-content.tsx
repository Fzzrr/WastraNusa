'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { mergeArticleDashboardData } from '@/components/admin/dashboard/dashboard-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleDashboard } from '@/hooks/use-article';
import { useProductDashboard } from '@/hooks/use-product-inventory';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import {
  type DashboardData,
  type DashboardStat,
  type DashboardStatIcon,
  type StockAlertItem,
} from '@/types/dashboard';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Eye,
  Package,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

const surfaceCardClassName =
  'border-0 bg-[#fffdf9] shadow-[0_1px_0_rgba(60,41,15,0.06),0_18px_40px_rgba(89,69,38,0.05)] ring-1 ring-[#e8decd]';
const sectionHeaderClassName = 'border-b border-[#eee2d0] px-5 py-4';
const sectionActionClassName =
  'px-0 text-[#776b5c] no-underline hover:no-underline';

function SummaryIcon({ icon }: { icon: DashboardStatIcon }) {
  const iconClassName = 'text-[#a98345]';

  switch (icon) {
    case 'package':
      return <Package className={iconClassName} />;
    case 'book-open':
      return <BookOpen className={iconClassName} />;
    default:
      return <TriangleAlert className={iconClassName} />;
  }
}

function SummaryTrendBadge({ stat }: { stat: DashboardStat }) {
  return (
    <Badge
      variant={stat.tone === 'warning' ? 'destructive' : 'secondary'}
      className={cn(
        'rounded-full border-0 px-2 py-0.5 text-[11px] shadow-none',
        stat.tone === 'warning' ? 'text-[#b45843]' : 'text-[#5f865a]',
      )}
    >
      {stat.tone === 'positive' ? (
        <ArrowUpRight data-icon="inline-start" />
      ) : stat.tone === 'warning' ? (
        <ArrowDownRight data-icon="inline-start" />
      ) : null}
      {stat.changeLabel}
    </Badge>
  );
}

function SummaryCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f8f1e4] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <SummaryIcon icon={stat.icon} />
        </div>
        <CardAction>
          <SummaryTrendBadge stat={stat} />
        </CardAction>
      </CardHeader>
      <CardContent className="px-5">
        <div className="text-4xl font-semibold tracking-tight text-[#30251d]">
          {stat.value}
        </div>
        <p className="mt-2 text-sm font-medium text-[#50463b]">
          {stat.description}
        </p>
        <p className="text-xs text-[#9b8f82]">{stat.footnote}</p>
      </CardContent>
    </Card>
  );
}

function StockStatusBadge({ item }: { item: StockAlertItem }) {
  return item.severity === 'out' ? (
    <Badge variant="destructive" className="bg-[#f5dfd8] text-[#b45843]">
      {item.stockLabel}
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-[#f4ead9] text-[#a56a2f]">
      {item.stockLabel}
    </Badge>
  );
}

function SectionActionButton({ href }: { href: string }) {
  return (
    <Button variant="link" size="sm" className={sectionActionClassName} asChild>
      <Link href={href}>
        Kelola
        <ChevronRight data-icon="inline-end" />
      </Link>
    </Button>
  );
}

function StockAlertsCard({ items }: { items: DashboardData['stockAlerts'] }) {
  return (
    <Card className={cn(surfaceCardClassName, 'min-h-[420px] gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <TriangleAlert className="text-[#a98345]" />
          Peringatan Stok
        </CardTitle>
        <CardAction>
          <SectionActionButton href="/admin/product-inventory" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 py-4">
        {items.length === 0 ? (
          <div className="text-sm text-[#8f8377]">
            Belum ada produk dengan stok rendah atau habis.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.name}
              className="flex items-start justify-between gap-3 border-b border-[#f2e9dc] pb-4 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-[#41372c]">{item.name}</p>
                <p className="text-xs text-[#998d80]">{item.category}</p>
              </div>
              <StockStatusBadge item={item} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PopularArticlesCard({
  articles,
}: {
  articles: DashboardData['popularArticles'];
}) {
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <BookOpen className="text-[#a98345]" />
          Artikel Paling Populer
        </CardTitle>
        <CardAction>
          <SectionActionButton href="/admin/article" />
        </CardAction>
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
                className="grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-[#f2e9dc] py-3 transition-colors hover:bg-[#fdf9f4] last:border-b-0"
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

function DashboardStatusFooter({
  label,
  adminName,
}: {
  label: string;
  adminName: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="hidden items-center gap-3 rounded-full bg-white/60 px-3 py-2 text-xs text-[#8d806f] shadow-[0_1px_0_rgba(60,41,15,0.04)] ring-1 ring-[#e8decd] md:flex">
        <Avatar size="sm" className="size-7">
          <AvatarFallback className="bg-[#ecd9ba] text-[#8b6b37]">
            {adminName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{label}</span>
      </div>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <Skeleton className="size-10 rounded-2xl bg-[#eee2d0]" />
        <CardAction>
          <Skeleton className="h-5 w-16 rounded-full bg-[#eee2d0]" />
        </CardAction>
      </CardHeader>
      <CardContent className="px-5">
        <Skeleton className="h-10 w-24 bg-[#eee2d0]" />
        <Skeleton className="mt-2 h-5 w-32 bg-[#eee2d0]" />
        <Skeleton className="mt-1 h-4 w-28 bg-[#eee2d0]" />
      </CardContent>
    </Card>
  );
}

function StockAlertsSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'min-h-[420px] gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <Skeleton className="size-4 rounded-full bg-[#eee2d0]" />
          <Skeleton className="h-4 w-28 bg-[#eee2d0]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 py-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 border-b border-[#f2e9dc] pb-4 last:border-b-0 last:pb-0"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-[#eee2d0]" />
              <Skeleton className="h-3 w-20 bg-[#eee2d0]" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md bg-[#eee2d0]" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PopularArticlesSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle className="flex items-center gap-2 text-sm text-[#41372c]">
          <Skeleton className="size-4 rounded-full bg-[#eee2d0]" />
          <Skeleton className="h-4 w-32 bg-[#eee2d0]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <div className="flex flex-col">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-[#f2e9dc] py-3 last:border-b-0"
            >
              <Skeleton className="size-4 bg-[#eee2d0] pt-0.5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 bg-[#eee2d0]" />
                <Skeleton className="h-3 w-32 bg-[#eee2d0]" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-3 w-12 bg-[#eee2d0]" />
                <Skeleton className="h-3 w-12 bg-[#eee2d0]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardContent() {
  const { data: session } = authClient.useSession();
  const { data: articleDashboardData, isLoading } = useArticleDashboard();
  const { data: productDashboardData, isLoading: isLoadingProducts } =
    useProductDashboard();

  const dashboardData = useMemo(
    () => mergeArticleDashboardData(articleDashboardData, productDashboardData),
    [articleDashboardData, productDashboardData],
  );

  const adminName = session?.user?.name ?? 'Admin WastraNusa';
  const adminHeaderSubtitle = useMemo(() => {
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

    const dateLabel = `${weekday}, ${day} ${month} ${year}`;

    return `WastraNusa Admin · ${dateLabel}`;
  }, []);
  const lastUpdatedLabel = 'Ringkasan data terakhir diperbarui hari ini';

  if (isLoading || isLoadingProducts) {
    return (
      <main className="flex flex-1 flex-col">
        <AdminHeader
          title="Dashboard Overview"
          subtitle={adminHeaderSubtitle}
        />
        <div className="flex flex-1 flex-col gap-6 px-4 py-5 md:px-8 md:py-7">
          <section className="grid gap-4 xl:grid-cols-3">
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
            <StockAlertsSkeleton />
            <PopularArticlesSkeleton />
          </section>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-full bg-[#eee2d0]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <AdminHeader title="Dashboard Overview" subtitle={adminHeaderSubtitle} />
      <div className="flex flex-1 flex-col gap-6 px-4 py-5 md:px-8 md:py-7">
        <section className="grid gap-4 xl:grid-cols-3">
          {dashboardData.summary?.map((stat) => (
            <SummaryCard key={stat.title} stat={stat} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <StockAlertsCard items={dashboardData.stockAlerts ?? []} />
          <PopularArticlesCard articles={dashboardData.popularArticles ?? []} />
        </section>

        <DashboardStatusFooter label={lastUpdatedLabel} adminName={adminName} />
      </div>
    </main>
  );
}
