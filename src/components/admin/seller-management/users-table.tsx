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
          'group border-t border-[#efe8dd] transition-colors',
          hasDetail && 'cursor-pointer hover:bg-[#faf7f2]',
          isExpanded && 'bg-[#faf7f2]',
        )}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'relative flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white transition-transform group-hover:scale-105',
                isSeller
                  ? 'bg-[#dfe8df] text-[#2f5543]'
                  : 'bg-[#efe3cc] text-[#9a7b4a]',
              )}
            >
              {getInitials(user.name)}
              {isSeller ? (
                <BadgeCheck className="absolute -right-1 -bottom-1 size-4 rounded-full bg-white fill-[#2f5543] text-white" />
              ) : null}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#2f3a33] transition-colors group-hover:text-[#2f5543]">
                {user.name}
              </p>
              {showShopName ? (
                <p className="truncate text-xs text-[#9a8f80]">
                  {application.shopName}
                </p>
              ) : null}
            </div>
          </div>
        </td>
        <td className="px-5 py-4 text-xs text-[#6f6a62]">
          {user.location ?? '—'}
          {user.locationSource ? (
            <p className="mt-0.5 text-xs text-[#a39c92]">
              {user.locationSource === 'ip'
                ? 'Perkiraan dari login terakhir'
                : 'Alamat pengiriman'}
            </p>
          ) : null}
        </td>
        <td className="px-5 py-4 text-sm text-[#2f3a33]">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                isSeller
                  ? 'bg-[#e7efe4] text-[#2f5543]'
                  : 'bg-[#f1ede6] text-[#6f6a62]',
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
              <span className="rounded-full bg-[#f8ecd6] px-2 py-0.5 text-xs font-medium text-[#a0702a]">
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
              'cursor-pointer text-[#4a4843] transition-colors hover:bg-[#f4efe5] disabled:opacity-30',
              isExpanded && 'bg-[#2f5543] text-white hover:bg-[#2f5543]',
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
        'overflow-hidden rounded-2xl ring-1',
        lightCardClassName,
        enterClassName,
      )}
      style={{ animationDelay: '320ms' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-[#faf7f2] text-xs font-medium tracking-wider text-[#8a8378] uppercase">
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
                <tr key={index} className="border-t border-[#efe8dd]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full bg-[#eee2d0]" />
                      <Skeleton className="h-4 w-32 bg-[#eee2d0]" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-3 w-20 bg-[#eee2d0]" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-14 bg-[#eee2d0]" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-6 bg-[#eee2d0]" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12">
                  <div className="flex flex-col items-center gap-3 text-sm text-[#8f8377]">
                    <span className="flex size-11 items-center justify-center rounded-full bg-[#f4efe5] text-[#b08a5e]">
                      <Search className="size-5" />
                    </span>
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
