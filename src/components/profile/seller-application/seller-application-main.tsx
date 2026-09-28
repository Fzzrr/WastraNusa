'use client';

import {
  Field,
  inputClassName,
  textareaClassName,
} from '@/components/form-sections';
import {
  ProfileEmptyState,
  ProfileSection,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KawungPattern } from '@/components/wastra-hero';
import {
  type SellerApplication,
  useCreateSellerApplication,
  useMySellerApplication,
} from '@/hooks/use-seller-application';
import { cn } from '@/lib/utils';
import {
  type CreateSellerApplicationInput,
  createSellerApplicationSchema,
} from '@/schemas/seller-application.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  Clock,
  type LucideIcon,
  Package,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef } from 'react';
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
    <ProfileSection
      icon={Store}
      title="Buka Toko"
      description="Jual wastra Anda ke pembeli di seluruh Nusantara"
    >
      {isPending ? (
        <div className="flex animate-pulse flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 rounded-xl bg-[#f4efe5]" />
            ))}
          </div>
          <div className="h-11 w-full rounded-xl bg-[#f2ede4]" />
          <div className="h-24 w-full rounded-xl bg-[#f6f2ea]" />
        </div>
      ) : error ? (
        <ProfileEmptyState
          icon={XCircle}
          tone="error"
          title="Gagal memuat status toko"
          description="Gagal memuat status pengajuan toko. Silakan coba lagi."
        />
      ) : (
        <SellerApplicationContent application={data ?? null} />
      )}
    </ProfileSection>
  );
}

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Users,
    title: 'Jangkau Pembeli',
    text: 'Produk tampil di katalog WastraNusa',
  },
  {
    icon: Package,
    title: 'Kelola Produk',
    text: 'Atur stok, varian, dan harga dengan mudah',
  },
  {
    icon: TrendingUp,
    title: 'Pantau Penjualan',
    text: 'Dashboard pendapatan & pesanan',
  },
];

function StatusPanel({
  icon: Icon,
  tone,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  tone: 'pending' | 'approved';
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl px-6 py-10 text-center',
        tone === 'approved'
          ? 'bg-gradient-to-br from-[#e3ece5] to-[#faf7f2]'
          : 'bg-gradient-to-br from-[#fbf0d9] to-[#faf7f2]',
      )}
    >
      <KawungPattern className="inset-0 size-full text-[#2f5b49] opacity-[0.04]" />
      <span
        className={cn(
          'relative grid size-16 place-items-center rounded-full ring-8',
          tone === 'approved'
            ? 'bg-[#2f5f49] text-[#e8cb8d] ring-[#2f5f49]/10'
            : 'bg-[#e8cb8d] text-[#6b4f1f] ring-[#e8cb8d]/25',
        )}
      >
        <Icon className={cn('size-8', tone === 'pending' && 'animate-pulse')} />
      </span>
      <div className="relative">
        <h3 className="text-lg font-bold text-[#2f4f3f]">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-[#6f6a62]">{children}</p>
      </div>
      {action ? <div className="relative">{action}</div> : null}
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
      <StatusPanel
        icon={Clock}
        tone="pending"
        title="Pengajuan Sedang Ditinjau"
      >
        Pengajuan toko <strong>{application.shopName}</strong> sedang kami
        tinjau. Kami akan memberitahu Anda setelah proses peninjauan selesai.
      </StatusPanel>
    );
  }

  if (application?.status === 'approved') {
    return (
      <StatusPanel
        icon={CheckCircle2}
        tone="approved"
        title="Selamat, toko Anda telah aktif!"
        action={
          <Button
            onClick={() => router.push('/seller/dashboard')}
            className={cn(profilePrimaryButtonClassName, 'h-10 px-6')}
          >
            <Store className="size-4" />
            Buka Panel Penjual
          </Button>
        }
      >
        Toko <strong>{application.shopName}</strong> sudah bisa dikelola melalui
        panel penjual.
      </StatusPanel>
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
      <div className="grid gap-3 sm:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="group flex items-start gap-3 rounded-xl bg-[#faf7f2] p-3.5 ring-1 ring-[#efe8dd] transition-colors hover:bg-[#f5ead3]/50"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f5ead3] text-[#a07a2c] transition-colors group-hover:bg-[#2f5f49] group-hover:text-[#e8cb8d]">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#2f4f3f]">{title}</p>
              <p className="text-xs text-[#9a8f80]">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-[#6f6a62]">
        Lengkapi data berikut untuk mengajukan pembukaan toko. Pengajuan Anda
        akan ditinjau oleh tim kami sebelum toko dapat diaktifkan.
      </p>

      {isRejected && application?.rejectionReason ? (
        <Alert variant="destructive" className="border-[#e2c9bb] bg-[#fbf1eb]">
          <AlertTitle>Pengajuan Sebelumnya Ditolak</AlertTitle>
          <AlertDescription>{application.rejectionReason}</AlertDescription>
        </Alert>
      ) : null}

      <Field label="Nama Toko" required error={errors.shopName?.message}>
        <Input
          {...register('shopName')}
          placeholder="Contoh: Batik Nusantara"
          className={inputClassName}
        />
      </Field>

      <Field label="Deskripsi Toko">
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Ceritakan tentang toko dan produk yang akan Anda jual..."
          className={textareaClassName}
        />
      </Field>

      <Field label="Nomor Telepon">
        <Input
          {...register('phoneNumber')}
          placeholder="08xxxxxxxxxx"
          className={inputClassName}
        />
      </Field>

      <Button
        type="submit"
        disabled={isPending}
        className={cn(profilePrimaryButtonClassName, 'h-11 text-base')}
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
