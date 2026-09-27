'use client';

import { BarChart, Sparkline } from '@/components/charts';
import { SellerHeader } from '@/components/seller/seller-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type SellerDashboardPeriod,
  useSellerDashboard,
} from '@/hooks/use-seller-dashboard';
import { cn, formatIDR } from '@/lib/utils';
import {
  BarChart3,
  type LucideIcon,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';

const surfaceCardClassName =
  'border-0 bg-[#fbfdf7] shadow-[0_1px_0_rgba(31,61,44,0.06),0_18px_40px_rgba(47,74,47,0.05)] ring-1 ring-[#dce6cd]';
const sectionHeaderClassName = 'border-b border-[#e2e8d6] px-5 py-4';

const PERIOD_OPTIONS: { value: SellerDashboardPeriod; label: string }[] = [
  { value: 7, label: '7 Hari' },
  { value: 30, label: '30 Hari' },
  { value: 90, label: '90 Hari' },
];

function StatCard({
  icon,
  value,
  label,
  footnote,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  footnote: string;
}) {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e9f0dc] text-[#4a6b3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="text-3xl font-semibold tracking-tight text-[#22331f]">
          {value}
        </div>
        <p className="mt-2 text-sm font-medium text-[#3f4a35]">{label}</p>
        <p className="text-xs text-[#889079]">{footnote}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <Skeleton className="size-10 rounded-2xl bg-[#dce6cd]" />
      </CardHeader>
      <CardContent className="px-5">
        <Skeleton className="h-9 w-32 bg-[#dce6cd]" />
        <Skeleton className="mt-2 h-5 w-28 bg-[#dce6cd]" />
        <Skeleton className="mt-1 h-4 w-36 bg-[#dce6cd]" />
      </CardContent>
    </Card>
  );
}

function PeriodFilter({
  value,
  onChange,
  disabled,
}: {
  value: SellerDashboardPeriod;
  onChange: (period: SellerDashboardPeriod) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-[#e6ecda] p-1">
      {PERIOD_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 rounded-lg px-3 text-sm',
            value === option.value
              ? 'bg-[#4a6b3a] text-[#f2e7c9] hover:bg-[#4a6b3a]'
              : 'text-[#5c6a4d] hover:bg-[#dce6cd]',
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <CardTitle className="flex items-center gap-2 text-sm text-[#2f4a2f]">
      <Icon className="text-[#4a6b3a]" />
      {title}
    </CardTitle>
  );
}
export function SellerDashboardContent() {
  const [period, setPeriod] = useState<SellerDashboardPeriod>(30);
  const { data, isLoading, isError, error, isFetching } =
    useSellerDashboard(period);

  return (
    <main className="flex flex-1 flex-col">
      <SellerHeader
        title="Dashboard Penjualan"
        subtitle="Ringkasan Performa Toko Anda"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-5 md:px-8 md:py-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#5c6a4d]">
            Menampilkan data {period} hari terakhir
          </p>
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            disabled={isFetching}
          />
        </div>

        {isError ? (
          <Card className={cn(surfaceCardClassName, 'py-10')}>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-medium text-[#b45843]">
                Gagal memuat data dashboard.
              </p>
              <p className="text-xs text-[#889079]">
                {error instanceof Error
                  ? error.message
                  : 'Terjadi kesalahan tak terduga.'}
              </p>
            </CardContent>
          </Card>
        ) : isLoading || !data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </section>
            <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
              <CardHeader className={sectionHeaderClassName}>
                <SectionTitle icon={BarChart3} title="Pendapatan per Minggu" />
              </CardHeader>
              <CardContent className="px-5 py-5">
                <Skeleton className="h-[220px] w-full rounded-lg bg-[#dce6cd]" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Wallet />}
                value={formatIDR(data.stats.netRevenue)}
                label="Total Pendapatan"
                footnote="Bersih setelah komisi"
              />
              <StatCard
                icon={<Receipt />}
                value={data.stats.totalOrders.toLocaleString('id-ID')}
                label="Total Pesanan"
                footnote="Pesanan lunas pada periode ini"
              />
              <StatCard
                icon={<TrendingUp />}
                value={formatIDR(data.stats.averageOrderValue)}
                label="Rata-rata Nilai"
                footnote="Rata-rata nilai per pesanan"
              />
              <StatCard
                icon={<BarChart3 />}
                value={formatIDR(data.stats.adminCommission)}
                label="Komisi Admin (15%)"
                footnote="Potongan platform"
              />
            </section>

            <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
              <CardHeader className={sectionHeaderClassName}>
                <SectionTitle icon={BarChart3} title="Pendapatan per Minggu" />
                <p className="text-xs text-[#889079]">
                  Pendapatan bersih per minggu (setelah komisi)
                </p>
              </CardHeader>
              <CardContent className="px-5 py-5">
                {data.weeklyRevenue.some((point) => point.value > 0) ? (
                  <BarChart
                    data={data.weeklyRevenue}
                    color="var(--color-brand)"
                    height={220}
                    valueFormatter={formatIDR}
                    ariaLabel="Pendapatan bersih per minggu"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm text-[#7d8a70]">
                    Belum ada pendapatan pada periode ini.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
              <CardHeader className={sectionHeaderClassName}>
                <CardTitle className="text-xs font-semibold tracking-wider text-[#5c6a4d] uppercase">
                  Rincian per Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 py-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-[#e6ecda] text-xs font-semibold tracking-wide text-[#5c6a4d]">
                      <tr>
                        <th className="px-5 py-3">Produk</th>
                        <th className="px-5 py-3">Kategori</th>
                        <th className="px-5 py-3 text-center">Terjual</th>
                        <th className="px-5 py-3 text-right">Pendapatan</th>
                        <th className="px-5 py-3 text-right">Komisi (15%)</th>
                        <th className="px-5 py-3 text-center">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-10 text-center text-sm text-[#7d8a70]"
                          >
                            Belum ada penjualan produk pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        data.products.map((product) => (
                          <tr
                            key={product.productId}
                            className="border-t border-[#e2e8d6]"
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-[#2f4a2f]">
                              {product.name}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#6d6a64]">
                              {product.category}
                            </td>
                            <td className="px-5 py-3 text-center text-sm font-semibold text-[#3d3a34]">
                              {product.unitsSold.toLocaleString('id-ID')}
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-semibold text-[#3d3a34]">
                              {formatIDR(product.revenue)}
                            </td>
                            <td className="px-5 py-3 text-right text-sm text-[#6d6a64]">
                              {formatIDR(product.commission)}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex justify-center">
                                <Sparkline
                                  data={product.trend}
                                  ariaLabel={`Trend pendapatan ${product.name}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
