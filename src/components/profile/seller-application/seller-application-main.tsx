'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type SellerApplication,
  useCreateSellerApplication,
  useMySellerApplication,
} from '@/hooks/use-seller-application';
import {
  type CreateSellerApplicationInput,
  createSellerApplicationSchema,
} from '@/schemas/seller-application.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Clock, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const SELLER_INTENT_KEY = 'wastranusa:seller-intent';

const EMPTY_DEFAULTS: CreateSellerApplicationInput = {
  shopName: '',
  description: '',
  phoneNumber: '',
};

export function SellerApplicationMain() {
  const { data, isPending, error } = useMySellerApplication();

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2d5] bg-[#fdfaf5] shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#e8e2d5] px-6 py-5">
        <h2 className="m-0 text-[18px] font-bold text-[#5c7365]">Buka Toko</h2>
      </div>

      <div className="p-6">
        {isPending ? (
          <div className="flex flex-col gap-4">
            <div className="h-4 w-40 animate-pulse rounded bg-[#efe8db]" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-[#f2ede4]" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-[#f6f2ea]" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-[#f2ede4]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#e2c9bb] bg-[#fbf1eb] p-6 text-sm text-[#8b5e4a]">
            Gagal memuat status pengajuan toko. Silakan coba lagi.
          </div>
        ) : (
          <SellerApplicationContent application={data ?? null} />
        )}
      </div>
    </div>
  );
}

function SellerApplicationContent({
  application,
}: {
  application: SellerApplication | null;
}) {
  const router = useRouter();

  if (application?.status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf3e0]">
          <Clock className="h-7 w-7 text-[#c08a3e]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#4d6356]">
            Pengajuan sedang ditinjau
          </h3>
          <p className="mt-1 max-w-md text-sm text-[#7a8a80]">
            Pengajuan toko <strong>{application.shopName}</strong> sedang kami
            tinjau. Kami akan memberitahu Anda setelah proses peninjauan
            selesai.
          </p>
        </div>
      </div>
    );
  }

  if (application?.status === 'approved') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6f1]">
          <CheckCircle2 className="h-7 w-7 text-[#3c5043]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#4d6356]">
            Selamat, toko Anda telah disetujui!
          </h3>
          <p className="mt-1 max-w-md text-sm text-[#7a8a80]">
            Pengajuan toko <strong>{application.shopName}</strong> telah
            disetujui. Anda kini dapat mengelola toko melalui panel penjual.
          </p>
        </div>
        <Button
          onClick={() => router.push('/seller/dashboard')}
          className="rounded-full bg-[#3c5043] px-6 hover:bg-[#2d3d32]"
        >
          <Store className="h-4 w-4" />
          Buka Panel Penjual
        </Button>
      </div>
    );
  }

  // No application yet, or a rejected one that can be re-submitted.
  return <SellerApplicationForm application={application} />;
}

function SellerApplicationForm({
  application,
}: {
  application: SellerApplication | null;
}) {
  const { mutateAsync, isPending } = useCreateSellerApplication();
  const formRef = useRef<HTMLFormElement>(null);
  const isRejected = application?.status === 'rejected';

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<CreateSellerApplicationInput>({
    resolver: zodResolver(createSellerApplicationSchema),
    defaultValues: application
      ? {
          shopName: application.shopName,
          description: application.description ?? '',
          phoneNumber: application.phoneNumber ?? '',
        }
      : EMPTY_DEFAULTS,
  });

  // Auto-detect the "apply as seller" intent flag set on the register page.
  // When present, scroll the form into view, focus the first field, then clear
  // the flag so it only fires once.
  useEffect(() => {
    let hasIntent = false;
    try {
      hasIntent = localStorage.getItem(SELLER_INTENT_KEY) === 'true';
      if (hasIntent) {
        localStorage.removeItem(SELLER_INTENT_KEY);
      }
    } catch {
      // localStorage may be unavailable (SSR/private mode) — ignore.
    }

    if (hasIntent) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFocus('shopName');
    }
  }, [setFocus]);

  const onSubmit = async (data: CreateSellerApplicationInput) => {
    try {
      const created = await mutateAsync({
        shopName: data.shopName.trim(),
        description: data.description?.trim() || null,
        phoneNumber: data.phoneNumber?.trim() || null,
      });
      toast.success(
        created?.status === 'approved'
          ? 'Toko berhasil dibuka'
          : 'Pengajuan toko berhasil dikirim',
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Gagal mengirim pengajuan toko',
      );
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-[#7a8a80]">
        Lengkapi data berikut untuk mengajukan pembukaan toko. Pengajuan Anda
        akan ditinjau oleh tim kami sebelum toko dapat diaktifkan.
      </p>

      {isRejected && application?.rejectionReason ? (
        <Alert variant="destructive" className="border-[#e2c9bb] bg-[#fbf1eb]">
          <AlertTitle>Pengajuan sebelumnya ditolak</AlertTitle>
          <AlertDescription>{application.rejectionReason}</AlertDescription>
        </Alert>
      ) : null}

      {/* Shop name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
          Nama Toko <span className="text-red-400">*</span>
        </label>
        <Input
          {...register('shopName')}
          placeholder="Contoh: Batik Nusantara"
          className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
        />
        {errors.shopName && (
          <p className="mt-1 text-xs text-red-500">{errors.shopName.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
          Deskripsi Toko{' '}
          <span className="text-xs font-normal text-[#8f9b94]">(opsional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Ceritakan tentang toko dan produk yang akan Anda jual..."
          className="w-full resize-none rounded-xl border border-[#e5ded5] bg-[#fdfaf7] px-4 py-3 text-sm text-[#4d6356] placeholder:text-[#b0b8b3] outline-none transition-all focus:border-[#5c7365] focus:ring-2 focus:ring-[#5c7365]/20"
        />
      </div>

      {/* Phone number */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#5c7365]">
          No. Telepon{' '}
          <span className="text-xs font-normal text-[#8f9b94]">(opsional)</span>
        </label>
        <Input
          {...register('phoneNumber')}
          placeholder="08xxxxxxxxxx"
          className="h-11 border-[#e5ded5] bg-[#fdfaf7] px-4 text-[#4d6356] placeholder:text-[#b0b8b3] focus-visible:border-[#5c7365] focus-visible:ring-[#5c7365]/30"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3c5043] text-base font-medium text-white transition-colors hover:bg-[#2d3d32]"
      >
        {isPending ? (
          <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Store className="h-4 w-4" />
        )}
        {isPending
          ? 'Mengirim...'
          : isRejected
            ? 'Ajukan Ulang'
            : 'Ajukan Toko'}
      </Button>
    </form>
  );
}
