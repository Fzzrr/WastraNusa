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
  Package,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';

const surfaceCardClassName =
  'rounded-2xl border-0 bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6]';
const sectionHeaderClassName = 'border-b border-[#efe8dd] px-6 py-5';

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
    <Card className={cn(surfaceCardClassName, 'py-6')}>
      <CardHeader className="items-start gap-3 px-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#f4efe5] text-[#8a6a3a]">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="text-3xl font-bold tracking-tight text-[#2f4f3f]">
          {value}
        </div>
        <p className="mt-2 text-sm font-medium text-[#5f5a52]">{label}</p>
        <p className="text-xs text-[#9a8f80]">{footnote}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'py-5')}>
      <CardHeader className="items-start gap-3 px-5">
        <Skeleton className="size-10 rounded-2xl bg-[#eee2d0]" />
      </CardHeader>
      <CardContent className="px-6">
        <Skeleton className="h-9 w-32 bg-[#eee2d0]" />
        <Skeleton className="mt-2 h-5 w-28 bg-[#eee2d0]" />
        <Skeleton className="mt-1 h-4 w-36 bg-[#eee2d0]" />
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
    <div className="inline-flex items-center gap-1 rounded-xl bg-[#fffdfa] p-1 ring-1 ring-[#ebe3d6]">
      {PERIOD_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 cursor-pointer rounded-lg px-3 text-sm',
            value === option.value
              ? 'bg-[#3a5a4a] text-white hover:bg-[#3a5a4a] hover:text-white'
              : 'text-[#6f6a62] hover:bg-[#f4efe5] hover:text-[#2f4f3f]',
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
    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#2f4f3f]">
      <Icon className="size-5 text-[#8a6a3a]" />
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

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#6f6a62]">
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
              <p className="text-xs text-[#9a8f80]">
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
                <Skeleton className="h-[220px] w-full rounded-lg bg-[#eee2d0]" />
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
                <p className="text-sm text-[#9a8f80]">
                  Pendapatan bersih per minggu (setelah komisi)
                </p>
              </CardHeader>
              <CardContent className="px-6 py-6">
                {data.weeklyRevenue.some((point) => point.value > 0) ? (
                  <BarChart
                    data={data.weeklyRevenue}
                    color="#3a5a4a"
                    height={220}
                    valueFormatter={formatIDR}
                    ariaLabel="Pendapatan bersih per minggu"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm text-[#8f8377]">
                    Belum ada pendapatan pada periode ini.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
              <CardHeader className={sectionHeaderClassName}>
                <SectionTitle icon={Package} title="Rincian per Produk" />
              </CardHeader>
              <CardContent className="px-0 py-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-[#faf7f2] text-[11px] font-medium tracking-wider text-[#8a8378] uppercase">
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
                            className="py-10 text-center text-sm text-[#8f8377]"
                          >
                            Belum ada penjualan produk pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        data.products.map((product) => (
                          <tr
                            key={product.productId}
                            className="border-t border-[#efe8dd]"
                          >
                            <td className="px-5 py-3 text-sm font-medium text-[#2f3a33]">
                              {product.name}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#6f6a62]">
                              {product.category}
                            </td>
                            <td className="px-5 py-3 text-center text-sm font-semibold text-[#2f4f3f]">
                              {product.unitsSold.toLocaleString('id-ID')}
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-semibold text-[#2f4f3f]">
                              {formatIDR(product.revenue)}
                            </td>
                            <td className="px-5 py-3 text-right text-sm text-[#6f6a62]">
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
