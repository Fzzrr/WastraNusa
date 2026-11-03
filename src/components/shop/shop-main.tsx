'use client';

import { ProfileEmptyState } from '@/components/profile/profile-section';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicShop } from '@/hooks/use-public-shop';
import { cn } from '@/lib/utils';
import { Store, XCircle } from 'lucide-react';

import { ShopHeader } from './shop-header';
import { ShopProductGrid } from './shop-product-grid';

const surfaceCardClassName =
  'rounded-2xl border-0 bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6]';

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <main className="border-t border-[#dbd4c7]">
    <section className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
      {children}
    </section>
  </main>
);

function ShopSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className={cn(surfaceCardClassName, 'overflow-hidden')}>
        <Skeleton className="h-20 w-full rounded-none bg-[#e6dfd1] sm:h-24" />
        <div className="px-5 pb-6 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Skeleton className="-mt-12 size-24 rounded-2xl bg-[#eee2d0] sm:-mt-14 sm:size-28" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-8 w-64 bg-[#eee2d0]" />
              <Skeleton className="h-4 w-40 bg-[#f2ede4]" />
            </div>
          </div>
          <Skeleton className="mt-4 h-4 w-full max-w-3xl bg-[#f2ede4]" />
          <Skeleton className="mt-2 h-4 w-2/3 bg-[#f2ede4]" />
          <div className="mt-5 flex flex-wrap gap-4 border-t border-[#efe8dd] pt-4">
            <Skeleton className="h-4 w-32 bg-[#f2ede4]" />
            <Skeleton className="h-4 w-28 bg-[#f2ede4]" />
            <Skeleton className="h-4 w-36 bg-[#f2ede4]" />
          </div>
        </div>
      </div>

      <div>
        <Skeleton className="h-6 w-40 bg-[#eee2d0]" />
        <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`shop-skeleton-${index}`}
              className="h-full overflow-hidden rounded-2xl border border-[#ddd4c6] bg-[#f9f5ed]"
            >
              <Skeleton className="h-56 w-full rounded-none bg-[#ece2d4]" />
              <div className="space-y-3 p-3.5">
                <Skeleton className="h-3 w-24 bg-[#e6dfd1]" />
                <Skeleton className="h-5 w-11/12 bg-[#e6dfd1]" />
                <Skeleton className="h-5 w-16 bg-[#e6dfd1]" />
              </div>
            </div>
          ))}
        </div>
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
      <div className="flex flex-col gap-6">
        <ShopHeader shop={data.shop} />
        <ShopProductGrid
          products={data.products}
          productCount={data.productCount}
        />
      </div>
    </PageShell>
  );
}
