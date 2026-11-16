'use client';

import {
  Field,
  ImagePreview,
  inputClassName,
  textareaClassName,
} from '@/components/form-sections';
import { SellerHeader } from '@/components/seller/seller-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type ShopProfile,
  useMyShopProfile,
  useUpdateShopProfile,
} from '@/hooks/use-shop-profile';
import { cn } from '@/lib/utils';
import {
  type UpdateShopProfileInput,
  updateShopProfileSchema,
} from '@/schemas/shop-profile.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Save, Store, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

const surfaceCardClassName = 'rounded-xl border-0 bg-card ring-1 ring-border';
const sectionHeaderClassName = 'px-6 pt-6';

export function SellerShopProfileContent() {
  const { data, isPending, error } = useMyShopProfile();

  return (
    <main className="flex flex-1 flex-col">
      <SellerHeader
        title="Profil Toko"
        subtitle="Kelola informasi publik toko Anda"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        {isPending ? (
          <ShopProfileSkeleton />
        ) : error ? (
          <Card className={cn(surfaceCardClassName, 'py-10')}>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <XCircle className="size-8 text-destructive" />
              <p className="text-base font-medium text-destructive">
                Gagal memuat profil toko.
              </p>
              <p className="text-[13px] text-ink-soft">
                {error instanceof Error
                  ? error.message
                  : 'Terjadi kesalahan tak terduga.'}
              </p>
            </CardContent>
          </Card>
        ) : !data ? (
          <Card className={cn(surfaceCardClassName, 'py-10')}>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Store className="size-8 text-ink-soft" />
              <p className="text-base font-medium text-ink">
                Profil toko belum tersedia.
              </p>
              <p className="text-[13px] text-ink-soft">
                Profil toko dibuat otomatis setelah pengajuan Anda disetujui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ShopProfileForm profile={data} />
        )}
      </div>
    </main>
  );
}

function ShopProfileSkeleton() {
  return (
    <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
      <CardHeader className={sectionHeaderClassName}>
        <Skeleton className="h-6 w-40 bg-surface" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-6 py-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 bg-surface" />
            <Skeleton className="h-11 w-full rounded-xl bg-surface" />
          </div>
        ))}
        <Skeleton className="h-11 w-40 self-end rounded-xl bg-surface" />
      </CardContent>
    </Card>
  );
}

function toDefaults(profile: ShopProfile): UpdateShopProfileInput {
  return {
    shopName: profile.shopName,
    description: profile.description ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    email: profile.email ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    province: profile.province ?? '',
    logoURL: profile.logoURL ?? '',
  };
}

function ShopProfileForm({ profile }: { profile: ShopProfile }) {
  const { mutateAsync, isPending } = useUpdateShopProfile();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateShopProfileInput>({
    resolver: zodResolver(updateShopProfileSchema),
    defaultValues: toDefaults(profile),
  });

  // Keep the form in sync when the profile is refetched in the background.
  useEffect(() => {
    reset(toDefaults(profile));
  }, [profile, reset]);

  const logoURL = useWatch({ control, name: 'logoURL' });

  const onSubmit = async (data: UpdateShopProfileInput) => {
    try {
      await mutateAsync(data);
      toast.success('Profil toko berhasil diperbarui');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Gagal memperbarui profil toko',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Store className="size-5 text-ink-soft" />
            Informasi Toko
          </CardTitle>
          <p className="text-base text-ink-soft">
            Informasi ini tampil kepada pembeli di WastraNusa.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-6 py-6">
          <Field label="Nama Toko" required error={errors.shopName?.message}>
            <Input
              {...register('shopName')}
              placeholder="Contoh: Batik Sari Nusantara"
              className={inputClassName}
            />
          </Field>

          <Field
            label="Deskripsi Toko"
            error={errors.description?.message}
            hint="Maksimal 500 karakter"
          >
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Ceritakan tentang toko dan produk Anda..."
              className={textareaClassName}
            />
          </Field>

          <Field
            label="URL Logo Toko"
            error={errors.logoURL?.message}
            hint="Tautan gambar logo (https://...)"
          >
            <div className="flex items-center gap-3">
              <ImagePreview url={logoURL} className="size-14" />
              <Input
                {...register('logoURL')}
                placeholder="https://contoh.com/logo.png"
                className={cn(inputClassName, 'flex-1')}
              />
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email Toko" error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
                placeholder="toko@contoh.com"
                className={inputClassName}
              />
            </Field>

            <Field label="Nomor Telepon" error={errors.phoneNumber?.message}>
              <Input
                {...register('phoneNumber')}
                placeholder="08xxxxxxxxxx"
                className={inputClassName}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(surfaceCardClassName, 'gap-0 py-0')}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-ink">
            <MapPin className="size-5 text-ink-soft" />
            Lokasi Toko
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-6 py-6">
          <Field label="Alamat" error={errors.address?.message}>
            <textarea
              {...register('address')}
              rows={2}
              placeholder="Jalan, nomor, RT/RW, kelurahan..."
              className={textareaClassName}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kota" error={errors.city?.message}>
              <Input
                {...register('city')}
                placeholder="Contoh: Yogyakarta"
                className={inputClassName}
              />
            </Field>

            <Field label="Provinsi" error={errors.province?.message}>
              <Input
                {...register('province')}
                placeholder="Contoh: DI Yogyakarta"
                className={inputClassName}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || !isDirty}
          className={cn(
            'h-11 cursor-pointer gap-2 rounded-full bg-brand px-6 text-on-field hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}
