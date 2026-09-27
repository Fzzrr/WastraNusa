'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerApplicationStatus } from '@/generated/prisma/enums';
import {
  type AdminSellerApplication,
  useAdminSellerApplications,
  useReviewSellerApplication,
} from '@/hooks/use-seller-application';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type FilterStatus = SellerApplicationStatus | 'all';

const STATUS_FILTER_OPTIONS: {
  value: SellerApplicationStatus;
  label: string;
}[] = [
  { value: SellerApplicationStatus.pending, label: 'Menunggu' },
  { value: SellerApplicationStatus.approved, label: 'Disetujui' },
  { value: SellerApplicationStatus.rejected, label: 'Ditolak' },
];

const STATUS_LABELS: Record<SellerApplicationStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

function getStatusBadgeClass(status: SellerApplicationStatus) {
  switch (status) {
    case SellerApplicationStatus.approved:
      return 'bg-emerald-100 text-emerald-700';
    case SellerApplicationStatus.rejected:
      return 'bg-red-100 text-red-700';
    case SellerApplicationStatus.pending:
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-[#ece7de]">
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-28 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full bg-[#eee2d0]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 bg-[#eee2d0]" />
            <Skeleton className="h-3 w-36 bg-[#eee2d0]" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-20 rounded-md bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-9 w-32 rounded-lg bg-[#eee2d0]" />
      </td>
    </tr>
  );
}
function RowGroup({
  application,
  isPending,
  isProcessing,
  isRejecting,
  rejectionReason,
  onApprove,
  onStartReject,
  onCancelReject,
  onChangeReason,
  onConfirmReject,
}: {
  application: AdminSellerApplication;
  isPending: boolean;
  isProcessing: boolean;
  isRejecting: boolean;
  rejectionReason: string;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onChangeReason: (value: string) => void;
  onConfirmReject: () => void;
}) {
  const { user } = application;
  const initials = user.name.substring(0, 2).toUpperCase();

  return (
    <>
      <tr className="border-t border-[#ece7de]">
        <td className="px-4 py-3 align-top">
          <p className="font-semibold text-[#2b2b2b]">{application.shopName}</p>
        </td>
        <td className="px-4 py-3 align-top">
          <div className="flex items-center gap-3">
            <Avatar size="sm" className="size-9">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-[#d2a36d] text-xs font-semibold text-[#3d3a34]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-[#3d3a34]">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 align-top text-sm text-[#6d6a64]">
          <div className="flex max-w-xs flex-col gap-0.5">
            <span>{application.description?.trim() || '—'}</span>
            <span className="text-xs text-muted-foreground">
              {application.phoneNumber?.trim() || 'Tanpa nomor telepon'}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 align-top">
          <Badge
            variant="secondary"
            className={getStatusBadgeClass(application.status)}
          >
            {STATUS_LABELS[application.status]}
          </Badge>
        </td>
        <td className="px-4 py-3 align-top text-sm text-[#6d6a64]">
          {formatDateLabel(application.createdAt)}
        </td>
        <td className="px-4 py-3 align-top">
          {isPending ? (
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                onClick={onApprove}
                disabled={isProcessing || isRejecting}
              >
                <Check data-icon="inline-start" />
                Setujui
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={onStartReject}
                disabled={isProcessing || isRejecting}
              >
                <X data-icon="inline-start" />
                Tolak
              </Button>
            </div>
          ) : application.status === SellerApplicationStatus.rejected &&
            application.rejectionReason ? (
            <p className="max-w-xs text-xs text-[#8f8377]">
              <span className="font-semibold text-[#b45843]">Alasan: </span>
              {application.rejectionReason}
            </p>
          ) : (
            <p className="text-center text-xs text-[#8f8377]">—</p>
          )}
        </td>
      </tr>
      {isRejecting ? (
        <tr className="border-t border-[#ece7de] bg-[#fbf6ef]">
          <td colSpan={6} className="px-4 py-3">
            <div className="flex flex-col gap-2">
              <label
                htmlFor={`reject-reason-${application.id}`}
                className="text-sm font-medium text-[#41372c]"
              >
                Alasan penolakan untuk &quot;{application.shopName}&quot;
              </label>
              <textarea
                id={`reject-reason-${application.id}`}
                value={rejectionReason}
                onChange={(event) => onChangeReason(event.target.value)}
                rows={3}
                placeholder="Tuliskan alasan penolakan yang akan dikirim ke pemohon"
                className="w-full rounded-lg border border-[#ddd6c9] bg-white p-3 text-sm outline-none focus:border-[#C0653B]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg border-[#ddd6c9] bg-white"
                  onClick={onCancelReject}
                  disabled={isProcessing}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-lg bg-red-600 hover:bg-red-700"
                  onClick={onConfirmReject}
                  disabled={isProcessing}
                >
                  Konfirmasi Tolak
                </Button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function AdminSellerManagementContent() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(
    SellerApplicationStatus.pending,
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: applications, isLoading } = useAdminSellerApplications(
    statusFilter === 'all' ? undefined : statusFilter,
  );
  const { mutate: reviewApplication } = useReviewSellerApplication();

  const items = applications ?? [];

  const closeRejectForm = () => {
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleApprove = (application: AdminSellerApplication) => {
    setProcessingId(application.id);
    reviewApplication(
      { id: application.id, data: { status: 'approved' } },
      {
        onSuccess: () => {
          toast.success(`Toko "${application.shopName}" disetujui`);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Gagal menyetujui pengajuan',
          );
        },
        onSettled: () => {
          setProcessingId(null);
        },
      },
    );
  };

  const handleConfirmReject = (application: AdminSellerApplication) => {
    const reason = rejectionReason.trim();
    if (reason.length === 0) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    setProcessingId(application.id);
    reviewApplication(
      {
        id: application.id,
        data: { status: 'rejected', rejectionReason: reason },
      },
      {
        onSuccess: () => {
          toast.success(`Pengajuan "${application.shopName}" ditolak`);
          closeRejectForm();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Gagal menolak pengajuan',
          );
        },
        onSettled: () => {
          setProcessingId(null);
        },
      },
    );
  };

  return (
    <main className="flex flex-col">
      <AdminHeader
        title="Seller Management"
        subtitle="Tinjau dan Kelola Pengajuan Seller"
      />

      <section className="flex-1 bg-[#f0ede5] px-5 py-5 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl bg-[#ebe6db] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? '...' : items.length} Pengajuan
            </p>

            <Select
              value={statusFilter}
              onValueChange={(value: FilterStatus) => {
                setStatusFilter(value);
                closeRejectForm();
              }}
            >
              <SelectTrigger className="h-9 w-full rounded-m border-[#ddd6c9] bg-white sm:w-[190px]">
                <SelectValue placeholder="Status Pengajuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* TABLE_MARKER */}
          <Card className="overflow-hidden rounded-2xl border border-[#ddd6c9] bg-background py-0 ring-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#ede8df] text-xs font-semibold tracking-wide text-[#6a645a]">
                  <tr>
                    <th className="px-4 py-3">Toko</th>
                    <th className="px-4 py-3">Pemohon</th>
                    <th className="px-4 py-3">Deskripsi / Telepon</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-[#8f8377]"
                      >
                        Belum ada pengajuan seller.
                      </td>
                    </tr>
                  ) : (
                    items.map((application) => {
                      const isPending =
                        application.status === SellerApplicationStatus.pending;
                      const isProcessing = processingId === application.id;
                      const isRejecting = rejectingId === application.id;
                      return (
                        <RowGroup
                          key={application.id}
                          application={application}
                          isPending={isPending}
                          isProcessing={isProcessing}
                          isRejecting={isRejecting}
                          rejectionReason={rejectionReason}
                          onApprove={() => handleApprove(application)}
                          onStartReject={() => {
                            setRejectingId(application.id);
                            setRejectionReason('');
                          }}
                          onCancelReject={closeRejectForm}
                          onChangeReason={setRejectionReason}
                          onConfirmReject={() =>
                            handleConfirmReject(application)
                          }
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
