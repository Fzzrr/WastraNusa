'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SellerManagementUser } from '@/services/sellerManagement.service';
import { BadgeCheck, MoreHorizontal, Search, Store, Users } from 'lucide-react';
import { useState } from 'react';

import { enterClassName, lightCardClassName } from './styles';
import { UserDetail } from './user-detail';

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const initials =
    words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2);
  return initials.toUpperCase();
}

function UserRow({
  user,
  isExpanded,
  onToggle,
}: {
  user: SellerManagementUser;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { application } = user;
  const showShopName = application && application.status !== 'rejected';
  const hasDetail = Boolean(application) || user.role === 'seller';
  const isSeller = user.role === 'seller';

  return (
    <>
      <tr
        onClick={hasDetail ? onToggle : undefined}
        className={cn(
          'group border-t border-border transition-colors',
          hasDetail && 'cursor-pointer hover:bg-surface',
          isExpanded && 'bg-surface',
        )}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'relative flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ring-2 ring-white transition-transform group-hover:scale-105',
                isSeller ? 'bg-surface text-ink' : 'bg-surface text-ink-soft',
              )}
            >
              {getInitials(user.name)}
              {isSeller ? (
                <BadgeCheck className="absolute -right-1 -bottom-1 size-4 rounded-full bg-card fill-brand text-white" />
              ) : null}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-ink transition-colors group-hover:text-ink">
                {user.name}
              </p>
              {showShopName ? (
                <p className="truncate text-[13px] text-ink-soft">
                  {application.shopName}
                </p>
              ) : null}
            </div>
          </div>
        </td>
        <td className="px-5 py-4 text-[13px] text-ink-soft">
          {user.location ?? '—'}
          {user.locationSource ? (
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {user.locationSource === 'ip'
                ? 'Perkiraan dari login terakhir'
                : 'Alamat pengiriman'}
            </p>
          ) : null}
        </td>
        <td className="px-5 py-4 text-[15px] text-ink">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-medium',
                isSeller ? 'bg-surface text-ink' : 'bg-surface text-ink-soft',
              )}
            >
              {isSeller ? (
                <Store className="size-3" />
              ) : (
                <Users className="size-3" />
              )}
              {isSeller ? 'Seller' : 'User'}
            </span>
            {application?.status === 'pending' ? (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[13px] font-medium text-ink-soft">
                Menunggu Review
              </span>
            ) : null}
          </div>
        </td>
        <td className="px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Detail ${user.name}`}
            aria-expanded={isExpanded}
            title={hasDetail ? 'Lihat detail' : 'Tidak ada data seller'}
            disabled={!hasDetail}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className={cn(
              'cursor-pointer text-ink transition-colors hover:bg-surface disabled:opacity-30',
              isExpanded && 'bg-brand text-on-field hover:bg-brand-strong',
            )}
          >
            <MoreHorizontal
              className={cn(
                'size-5 transition-transform duration-300',
                isExpanded && 'rotate-90',
              )}
            />
          </Button>
        </td>
      </tr>
      {isExpanded && hasDetail ? (
        <tr>
          <td colSpan={4} className="p-0">
            <UserDetail user={user} onClose={onToggle} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function UsersTable({
  users,
  isLoading,
}: {
  users: SellerManagementUser[];
  isLoading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl ring-1',
        lightCardClassName,
        enterClassName,
      )}
      style={{ animationDelay: '320ms' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-surface text-[13px] font-medium text-ink-soft">
            <tr>
              <th className="w-[38%] px-5 py-4">User</th>
              <th className="px-5 py-4">Lokasi</th>
              <th className="px-5 py-4">Role</th>
              <th className="w-20 px-5 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full bg-surface" />
                      <Skeleton className="h-4 w-32 bg-surface" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-3 w-20 bg-surface" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-14 bg-surface" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-6 bg-surface" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12">
                  <div className="flex flex-col items-center gap-3 text-[15px] text-ink-soft">
                    <Search
                      className="shrink-0 size-5 text-ink-soft"
                      strokeWidth={1.75}
                    />
                    Tidak ada user yang cocok.
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isExpanded={expandedId === user.id}
                  onToggle={() =>
                    setExpandedId((current) =>
                      current === user.id ? null : user.id,
                    )
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
