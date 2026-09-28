'use client';

import { AdminBrandChip, AdminHeader } from '@/components/admin/admin-header';
import { KpiChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminSellerApplications,
  useDemoteSeller,
  useReviewSellerApplication,
  useSellerManagementStats,
  useSellerManagementUsers,
} from '@/hooks/use-seller-application';
import { cn, formatIDR } from '@/lib/utils';
import type {
  SellerManagementRoleFilter,
  SellerManagementSort,
} from '@/repositories/sellerManagement.repository';
import type { SellerManagementUser } from '@/services/sellerManagement.service';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Check,
  ChevronDown,
  type LucideIcon,
  Mail,
  MoreHorizontal,
  Phone,
  Receipt,
  Search,
  Store,
  TrendingUp,
  UserMinus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type RoleFilter = SellerManagementRoleFilter | 'all';

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'user', label: 'User' },
  { value: 'seller', label: 'Seller' },
  { value: 'pending', label: 'Menunggu Review' },
  { value: 'rejected', label: 'Ditolak' },
];

const SORT_OPTIONS: { value: SellerManagementSort; label: string }[] = [
  { value: 'newest', label: 'Terbaru Bergabung' },
  { value: 'oldest', label: 'Terlama Bergabung' },
  { value: 'name', label: 'Nama A–Z' },
];

const compactNumber = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const toJuta = (value: number) => value / 1_000_000;
const fromJuta = (value: number) => formatIDR(value * 1_000_000);

const lightCardClassName =
  'bg-[#fffdfa] ring-[#ebe3d6] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)]';
const enterClassName =
  'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both';
const hoverLiftClassName =
  'transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(60,41,15,0.05),0_18px_40px_rgba(89,69,38,0.12)]';

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const initials =
    words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2);
  return initials.toUpperCase();
}

function ChangeBadge({ percent }: { percent: number | null }) {
  if (percent === null) return null;
  const up = percent >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
        up ? 'bg-[#e7efe4] text-[#3f6b4a]' : 'bg-[#f6e1dd] text-[#b04a3a]',
      )}
    >
      <Icon className="size-2.5" />
      {Math.abs(percent).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  badge,
  dark = false,
  delay = 0,
  children,
}: {
  icon: LucideIcon;
  delay?: number;
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'group rounded-2xl p-5 ring-1',
        enterClassName,
        hoverLiftClassName,
        dark
          ? 'bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-white ring-[#3a5a4a]'
          : lightCardClassName,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-lg transition-colors',
              dark
                ? 'bg-white/10 text-[#e8cb8d] group-hover:bg-[#e8cb8d] group-hover:text-[#2f4b3d]'
                : 'bg-[#f4efe5] text-[#8a6a3a] group-hover:bg-[#2f5543] group-hover:text-[#f4efe2]',
            )}
          >
            <Icon className="size-3.5" />
          </span>
          <p
            className={cn(
              'text-[11px] font-medium tracking-wider uppercase',
              dark ? 'text-white/80' : 'text-[#5f5a52]',
            )}
          >
            {label}
          </p>
        </div>
        {badge}
      </div>
      <p
        className={cn(
          'mt-3 text-3xl font-bold tracking-tight tabular-nums',
          dark ? 'text-white' : 'text-[#2a3a31]',
        )}
      >
        {value}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function KpiCards() {
  const { data, isLoading } = useSellerManagementStats();

  if (isLoading || !data) {
    return (
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn('rounded-2xl p-5 ring-1', lightCardClassName)}
          >
            <Skeleton className="h-3 w-32 bg-[#eee2d0]" />
            <Skeleton className="mt-3 h-8 w-24 bg-[#eee2d0]" />
            <Skeleton className="mt-4 h-[136px] w-full bg-[#eee2d0]" />
          </div>
        ))}
      </section>
    );
  }

  const { months, verifiedSellers, monthlySales, annualRevenue, orders } = data;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <KpiCard
        dark
        icon={BadgeCheck}
        label="Seller Terverifikasi"
        value={verifiedSellers.total.toLocaleString('id-ID')}
        badge={
          verifiedSellers.newThisMonth > 0 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white">
              <ArrowUp className="size-2.5" />
              {verifiedSellers.newThisMonth} Baru
            </span>
          ) : null
        }
      >
        <KpiChart
          type="bar"
          tone="dark"
          labels={months}
          values={verifiedSellers.series}
          color="#7f8b62"
          highlightColor="#e8cb8d"
          tickFormatter={(v) => Math.round(v).toLocaleString('id-ID')}
          ariaLabel="Jumlah seller terverifikasi per bulan"
        />
      </KpiCard>

      <KpiCard
        icon={TrendingUp}
        delay={80}
        label="Penjualan Bulan Ini"
        value={`${compactNumber.format(monthlySales.current)}`}
        badge={<ChangeBadge percent={monthlySales.changePercent} />}
      >
        <KpiChart
          type="line"
          labels={months}
          values={monthlySales.series.map(toJuta)}
          color="#b8613f"
          valueFormatter={fromJuta}
          ariaLabel="Penjualan per bulan (juta rupiah)"
        />
      </KpiCard>

      <KpiCard
        icon={Wallet}
        delay={160}
        label="Revenue Tahunan"
        value={`${compactNumber.format(annualRevenue.current)}`}
        badge={<ChangeBadge percent={annualRevenue.changePercent} />}
      >
        <KpiChart
          type="line"
          labels={months}
          values={annualRevenue.series.map(toJuta)}
          color="#c0a06a"
          valueFormatter={fromJuta}
          ariaLabel="Revenue 12 bulan terakhir (juta rupiah)"
        />
      </KpiCard>

      <KpiCard
        icon={Receipt}
        delay={240}
        label="Total Penjualan"
        value={
          <>
            {orders.current.toLocaleString('id-ID')}
            <span className="ml-1.5 text-base font-medium text-[#9a8f80]">
              Transaksi
            </span>
          </>
        }
        badge={<ChangeBadge percent={orders.changePercent} />}
      >
        <KpiChart
          type="bar"
          labels={months}
          values={orders.series}
          color="#c9bfb6"
          tickFormatter={(v) => Math.round(v).toLocaleString('id-ID')}
          ariaLabel="Jumlah transaksi per bulan"
        />
      </KpiCard>
    </section>
  );
}

function StatusTabs({
  value,
  onChange,
  pendingCount,
}: {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
  pendingCount: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter status"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#fffdfa] p-1 ring-1 ring-[#e5ded5]"
    >
      {ROLE_FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm whitespace-nowrap transition-all duration-200',
              isActive
                ? 'bg-[#3a5a4a] font-medium text-white shadow-[0_4px_12px_rgba(47,75,61,0.25)]'
                : 'text-[#6f6a62] hover:bg-[#f4efe5] hover:text-[#2f5543]',
            )}
          >
            {option.label}
            {option.value === 'pending' && pendingCount > 0 ? (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                  isActive
                    ? 'bg-[#e8cb8d] text-[#2f4b3d]'
                    : 'bg-[#f6e7de] text-[#a15d3b]',
                )}
              >
                {pendingCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function SortMenu({
  value,
  onChange,
}: {
  value: SellerManagementSort;
  onChange: (value: SellerManagementSort) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeLabel = SORT_OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Urutkan"
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#fffdfa] px-4 text-sm text-[#2f3a33] ring-1 ring-[#e5ded5] transition-all hover:ring-[#3a5a4a]"
      >
        <ArrowUpDown className="size-4 text-[#b08a5e]" />
        {activeLabel}
        <ChevronDown
          className={cn(
            'size-4 text-[#9a8f80] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-10 mt-2 w-52 origin-top-right animate-in overflow-hidden rounded-xl bg-[#fffdfa] p-1 shadow-[0_12px_32px_rgba(89,69,38,0.14)] ring-1 ring-[#ebe3d6] duration-150 fade-in zoom-in-95">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#f4efe5]',
                option.value === value
                  ? 'bg-[#f4efe5] font-medium text-[#2f5543]'
                  : 'text-[#4a4843]',
              )}
            >
              {option.label}
              {option.value === value ? <Check className="size-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const APPLICATION_STATUS: Record<
  'pending' | 'approved' | 'rejected',
  { label: string; className: string }
> = {
  pending: {
    label: 'Menunggu Review',
    className: 'bg-[#f8ecd6] text-[#a0702a]',
  },
  approved: { label: 'Disetujui', className: 'bg-[#e7efe4] text-[#3f6b4a]' },
  rejected: { label: 'Ditolak', className: 'bg-[#f6e1dd] text-[#b04a3a]' },
};

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f4efe5] text-[#8a6a3a]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wider text-[#9a8f80] uppercase">
          {label}
        </p>
        <p className="truncate text-sm text-[#2f3a33]">{children}</p>
      </div>
    </div>
  );
}

type ReasonAction = 'reject' | 'demote';

function UserDetail({
  user,
  onClose,
}: {
  user: SellerManagementUser;
  onClose: () => void;
}) {
  const { application } = user;
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const [reason, setReason] = useState('');
  const { mutate: review, isPending: isReviewing } =
    useReviewSellerApplication();
  const { mutate: demote, isPending: isDemoting } = useDemoteSeller();
  const isBusy = isReviewing || isDemoting;
  const status = application ? APPLICATION_STATUS[application.status] : null;

  const onError = (error: Error) => {
    toast.error(error.message || 'Terjadi kesalahan');
  };

  const approve = () => {
    if (!application) return;
    review(
      { id: application.id, data: { status: 'approved' } },
      {
        onSuccess: () => {
          toast.success(`Toko "${application.shopName}" disetujui`);
          onClose();
        },
        onError,
      },
    );
  };

  const submitReason = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error('Alasan wajib diisi');
      return;
    }

    if (reasonAction === 'demote') {
      demote(
        { userId: user.id, data: { reason: trimmedReason } },
        {
          onSuccess: () => {
            toast.success(`${user.name} sekarang menjadi user biasa`);
            onClose();
          },
          onError,
        },
      );
      return;
    }

    if (!application) return;
    review(
      {
        id: application.id,
        data: { status: 'rejected', rejectionReason: trimmedReason },
      },
      {
        onSuccess: () => {
          toast.success(`Pengajuan "${application.shopName}" ditolak`);
          onClose();
        },
        onError,
      },
    );
  };

  return (
    <div className="border-t border-[#efe8dd] bg-[#faf7f2] px-5 py-5">
      <div className="flex animate-in flex-col gap-5 rounded-xl border-l-4 border-[#d2a36d] bg-white p-5 shadow-[0_8px_24px_rgba(89,69,38,0.08)] ring-1 ring-[#ebe3d6] duration-300 fade-in slide-in-from-top-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d]">
              <Store className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#2a3a31]">
                {application?.shopName ?? 'Tanpa data toko'}
              </p>
              <p className="text-xs text-[#9a8f80]">Pengajuan seller</p>
            </div>
          </div>
          {status ? (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                status.className,
              )}
            >
              {status.label}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={Mail} label="Email">
            {user.email}
          </InfoItem>
          <InfoItem icon={Phone} label="Telepon">
            {application?.phoneNumber?.trim() || '—'}
          </InfoItem>
        </div>

        {application ? (
          <div className="rounded-lg bg-[#faf7f2] px-4 py-3">
            <p className="text-[11px] font-medium tracking-wider text-[#9a8f80] uppercase">
              Deskripsi Toko
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#2f3a33]">
              {application.description?.trim() || '—'}
            </p>
          </div>
        ) : null}

        {application?.status === 'rejected' && application.rejectionReason ? (
          <div className="rounded-lg bg-[#fbeeeb] px-4 py-3 text-sm text-[#8a3b2e]">
            <span className="font-semibold">Alasan: </span>
            {application.rejectionReason}
          </div>
        ) : null}

        {reasonAction ? (
          <div className="flex flex-col gap-2 border-t border-[#efe8dd] pt-4">
            <label className="text-sm font-medium text-[#2f3a33]">
              {reasonAction === 'demote'
                ? `Alasan mencabut status seller ${user.name}`
                : `Alasan menolak "${application?.shopName}"`}
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Alasan ini akan terlihat oleh user"
              className="w-full animate-in rounded-lg border border-[#ddd6c9] bg-white p-3 text-sm transition-shadow outline-none fade-in focus:border-[#C0653B] focus:ring-3 focus:ring-[#C0653B]/15"
            />
            {reasonAction === 'demote' ? (
              <p className="text-xs text-[#9a8f80]">
                User akan kehilangan akses ke panel seller dan otomatis keluar
                dari sesi login-nya. Produk yang sudah ada tidak dihapus.
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-lg border-[#ddd6c9] bg-white"
                onClick={() => {
                  setReasonAction(null);
                  setReason('');
                }}
                disabled={isBusy}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-lg bg-red-600 hover:bg-red-700"
                onClick={submitReason}
                disabled={isBusy}
              >
                {reasonAction === 'demote'
                  ? 'Konfirmasi Cabut'
                  : 'Konfirmasi Tolak'}
              </Button>
            </div>
          </div>
        ) : application?.status === 'pending' || user.role === 'seller' ? (
          <div className="flex justify-end gap-2 border-t border-[#efe8dd] pt-4">
            {application?.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setReasonAction('reject')}
                  disabled={isBusy}
                >
                  <X data-icon="inline-start" />
                  Tolak
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-lg bg-[#3a5a4a] hover:bg-[#2f4b3d]"
                  onClick={approve}
                  disabled={isBusy}
                >
                  <Check data-icon="inline-start" />
                  Setujui
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setReasonAction('demote')}
                disabled={isBusy}
              >
                <UserMinus data-icon="inline-start" />
                Cabut Status Seller
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
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
            <p className="mt-0.5 text-[10px] text-[#a39c92]">
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
              <span className="rounded-full bg-[#f8ecd6] px-2 py-0.5 text-[10px] font-medium text-[#a0702a]">
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

function UsersTable({
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
          <thead className="bg-[#faf7f2] text-[10px] font-medium tracking-wider text-[#8a8378] uppercase">
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

export function AdminSellerManagementContent() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sort, setSort] = useState<SellerManagementSort>('newest');
  const { data: pendingApplications } = useAdminSellerApplications('pending');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: users, isLoading } = useSellerManagementUsers(
    search,
    roleFilter,
    sort,
  );

  return (
    <main className="flex flex-col">
      <AdminHeader
        title="Seller Management"
        subtitle={
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <AdminBrandChip />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffdfa] px-3 py-1 text-[#6f6a62] ring-1 ring-[#ebe3d6]">
              <Store className="size-3.5 text-[#b08a5e]" />
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
                className="peer h-11 w-full rounded-xl bg-[#fffdfa] pr-10 pl-10 text-sm text-[#2f3a33] shadow-[0_1px_2px_rgba(60,41,15,0.04)] ring-1 ring-[#e5ded5] transition-shadow outline-none placeholder:text-[#a39c92] focus:shadow-[0_0_0_4px_rgba(58,90,74,0.12)] focus:ring-[#3a5a4a]"
              />
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#a39c92] transition-colors peer-focus:text-[#2f5543]" />
              {searchInput ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => setSearchInput('')}
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 animate-in cursor-pointer items-center justify-center rounded-full text-[#a39c92] transition-colors fade-in hover:bg-[#f4efe5] hover:text-[#2f3a33]"
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
              <span className="text-sm whitespace-nowrap text-[#9a8f80] tabular-nums">
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
