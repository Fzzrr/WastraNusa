'use client';

import { CatalogProductGridSkeleton } from '@/components/catalog/main/catalog-product-grid';
import { ProfileEmptyState } from '@/components/profile/profile-section';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicShop } from '@/hooks/use-public-shop';
import { cn } from '@/lib/utils';
import { Home, Store, XCircle } from 'lucide-react';

import { ShopHeader } from './shop-header';
import { ShopProductGrid } from './shop-product-grid';

const surfaceCardClassName = 'rounded-xl border-0 bg-card ring-1 ring-border';

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <main>
    <section className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
      {children}
    </section>
  </main>
);

function ShopSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-72 animate-pulse bg-field md:h-80" />
      <div
        className={cn(
          surfaceCardClassName,
          'grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={`shop-info-skeleton-${index}`}
            className="h-16 rounded-xl bg-surface"
          />
        ))}
      </div>
      <div>
        <Skeleton className="h-8 w-48 bg-surface" />
        <Skeleton className="mt-2 h-5 w-64 bg-surface" />
        <CatalogProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

function isNotFound(error: Error): boolean {
  return /tidak ditemukan|not found|404/i.test(error.message);
}

export function ShopMain({ sellerId }: { sellerId: string }) {
  const { data, isPending, error } = usePublicShop(sellerId);

  if (isPending) {
    return (
      <PageShell>
        <ShopSkeleton />
      </PageShell>
    );
  }

  if (error) {
    const notFound = error instanceof Error && isNotFound(error);
    return (
      <PageShell>
        {notFound ? (
          <ProfileEmptyState
            icon={Store}
            title="Toko tidak ditemukan"
            description="Toko yang Anda cari tidak tersedia atau sudah tidak aktif."
            tone="neutral"
          />
        ) : (
          <ProfileEmptyState
            icon={XCircle}
            title="Gagal memuat toko"
            description={
              error instanceof Error
                ? error.message
                : 'Terjadi kesalahan tak terduga. Silakan coba lagi.'
            }
            tone="error"
          />
        )}
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <ProfileEmptyState
          icon={Store}
          title="Toko tidak ditemukan"
          description="Toko yang Anda cari tidak tersedia atau sudah tidak aktif."
          tone="neutral"
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-12">
        <Breadcrumb>
          <BreadcrumbList className="text-[15px] font-medium text-ink-soft">
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-1.5 hover:text-ink"
              >
                <Home className="size-3.5" />
                Beranda
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/catalog" className="hover:text-ink">
                Katalog
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-ink">
                {data.shop.shopName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ShopHeader shop={data.shop} products={data.products} />
        <ShopProductGrid products={data.products} />
      </div>
    </PageShell>
  );
}
