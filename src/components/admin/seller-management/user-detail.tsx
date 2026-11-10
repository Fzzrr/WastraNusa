'use client';

import { Button } from '@/components/ui/button';
import {
  useDemoteSeller,
  useReviewSellerApplication,
} from '@/hooks/use-seller-application';
import { cn } from '@/lib/utils';
import type { SellerManagementUser } from '@/services/sellerManagement.service';
import {
  Check,
  type LucideIcon,
  Mail,
  Phone,
  Store,
  UserMinus,
  X,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

const APPLICATION_STATUS: Record<
  'pending' | 'approved' | 'rejected',
  { label: string; className: string }
> = {
  pending: {
    label: 'Menunggu Review',
    className: 'bg-surface text-ink-soft',
  },
  approved: { label: 'Disetujui', className: 'bg-surface text-ink' },
  rejected: {
    label: 'Ditolak',
    className: 'bg-destructive/10 text-destructive',
  },
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
      <Icon className="shrink-0 size-5 text-ink-soft" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink-soft">{label}</p>
        <p className="truncate text-base text-ink">{children}</p>
      </div>
    </div>
  );
}

type ReasonAction = 'reject' | 'demote';

export function UserDetail({
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
    <div className="border-t border-border bg-surface px-5 py-5">
      <div className="flex animate-in flex-col gap-5 rounded-xl border-l-4 border-gold bg-card p-5 ring-1 ring-border duration-300 fade-in slide-in-from-top-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Store className="shrink-0 size-5 text-brand" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">
                {application?.shopName ?? 'Tanpa data toko'}
              </p>
              <p className="text-[13px] text-ink-soft">Pengajuan seller</p>
            </div>
          </div>
          {status ? (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[13px] font-medium',
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
          <div className="rounded-lg bg-surface px-4 py-3">
            <p className="text-[13px] font-medium text-ink-soft">
              Deskripsi Toko
            </p>
            <p className="mt-1 text-base leading-relaxed text-ink">
              {application.description?.trim() || '—'}
            </p>
          </div>
        ) : null}

        {application?.status === 'rejected' && application.rejectionReason ? (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-[15px] text-destructive">
            <span className="font-semibold">Alasan: </span>
            {application.rejectionReason}
          </div>
        ) : null}

        {reasonAction ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <label className="text-[15px] font-medium text-ink">
              {reasonAction === 'demote'
                ? `Alasan mencabut status seller ${user.name}`
                : `Alasan menolak "${application?.shopName}"`}
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Alasan ini akan terlihat oleh user"
              className="w-full animate-in rounded-lg border border-border bg-card p-3 text-[15px] transition-shadow outline-none fade-in focus:border-destructive/30 focus:ring-3 focus:ring-destructive/30/15"
            />
            {reasonAction === 'demote' ? (
              <p className="text-[13px] text-ink-soft">
                User akan kehilangan akses ke panel seller dan otomatis keluar
                dari sesi login-nya. Produk yang sudah ada tidak dihapus.
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full border-border bg-card"
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
                className="h-9 rounded-full bg-red-600 hover:bg-red-700"
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
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            {application?.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full border-red-200 text-destructive hover:bg-red-50 hover:text-red-700"
                  onClick={() => setReasonAction('reject')}
                  disabled={isBusy}
                >
                  <X data-icon="inline-start" />
                  Tolak
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-full bg-brand hover:bg-brand-strong"
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
                className="h-9 rounded-full border-red-200 text-destructive hover:bg-red-50 hover:text-red-700"
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
