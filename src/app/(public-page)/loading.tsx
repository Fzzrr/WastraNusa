import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shown while a public page's server data loads (e.g. the catalog and
 * encyclopedia prefetch), so navigation responds at once.
 */
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Memuat halaman"
      className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-6 md:px-6 lg:px-8"
    >
      <Skeleton className="mb-6 h-4 w-40 bg-[#e6dfd1]" />
      <Skeleton className="mb-8 h-48 w-full rounded-3xl bg-[#e6dfd1]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl bg-[#e6dfd1]" />
        ))}
      </div>
    </main>
  );
}
