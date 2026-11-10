'use client';

import { AdminBrandChip, AdminHeader } from '@/components/admin/admin-header';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  useAdminSellerApplications,
  useSellerManagementUsers,
} from '@/hooks/use-seller-application';
import type { SellerManagementSort } from '@/repositories/sellerManagement.repository';
import { Search, Store, X } from 'lucide-react';
import { useState } from 'react';

import { KpiCards } from './kpi-cards';
import { type RoleFilter, SortMenu, StatusTabs } from './user-filters';
import { UsersTable } from './users-table';

export function AdminSellerManagementContent() {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sort, setSort] = useState<SellerManagementSort>('newest');
  const { data: pendingApplications } = useAdminSellerApplications('pending');

  const { data: users, isLoading } = useSellerManagementUsers(
    search,
    roleFilter,
    sort,
  );

  return (
    <main className="flex flex-col">
      <AdminHeader
        title="Manajemen Penjual"
        subtitle={
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[15px]">
            <AdminBrandChip />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-ink-soft ring-1 ring-border">
              <Store className="size-3.5 text-ink-soft" />
              Kelola seller, pengajuan toko, dan performa penjualan
            </span>
          </div>
        }
        variant="plain"
      />

      <div className="flex flex-col gap-8 px-4 py-6 md:px-8">
        <KpiCards />

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari seller atau toko..."
                className="peer h-11 w-full rounded-xl bg-card pr-10 pl-10 text-[15px] text-ink ring-1 ring-border transition-shadow outline-none placeholder:text-ink-soft focus:ring-brand"
              />
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft transition-colors peer-focus:text-ink" />
              {searchInput ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => setSearchInput('')}
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 animate-in cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors fade-in hover:bg-surface hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <StatusTabs
              value={roleFilter}
              onChange={setRoleFilter}
              pendingCount={pendingApplications?.length ?? 0}
            />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[15px] whitespace-nowrap text-ink-soft tabular-nums">
                {isLoading ? '…' : `${(users ?? []).length} User`}
              </span>
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>

          <UsersTable users={users ?? []} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}
