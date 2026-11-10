'use client';

import { Field, inputClassName } from '@/components/form-sections';
import {
  ProfileSection,
  profileOutlineButtonClassName,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle,
  Info,
  KeyRound,
  Loader2,
  Lock,
  MonitorSmartphone,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v3';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru tidak cocok',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function SecurityRow({
  icon,
  title,
  subtitle,
  status,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-ink-soft">{icon}</span>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">{title}</div>
          {subtitle && (
            <div className="truncate text-[15px] text-ink-soft">{subtitle}</div>
          )}
        </div>
      </div>
      {status}
    </div>
  );
}

export default function SecuritySection() {
  const { data, isPending } = authClient.useSession();
  const session = data?.session;

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOAuthOnly, setIsOAuthOnly] = useState(false);

  useEffect(() => {
    const checkAccounts = async () => {
      try {
        const { data: accounts } = await authClient.listAccounts();
        if (accounts) {
          const hasCredential = accounts.some(
            (acc) => acc.providerId === 'credential',
          );
          setIsOAuthOnly(!hasCredential);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };
    checkAccounts();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toast.error(result.error.message || 'Gagal mengubah password');
      } else {
        toast.success('Password berhasil diubah');
        setIsChangingPassword(false);
        reset();
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengubah password');
    } finally {
      setIsSaving(false);
    }
  };

  const loginDate = session?.createdAt
    ? new Date(session.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  const passwordField = (
    name: keyof PasswordFormValues,
    label: string,
    hint?: string,
  ) => (
    <Field label={label} required error={errors[name]?.message} hint={hint}>
      <Input type="password" {...register(name)} className={inputClassName} />
    </Field>
  );

  return (
    <ProfileSection
      icon={ShieldCheck}
      title="Keamanan Akun"
      description="Kelola password dan pantau aktivitas login"
      aside={
        !isChangingPassword ? (
          <Button
            variant="outline"
            onClick={() => setIsChangingPassword(true)}
            disabled={isOAuthOnly}
            className={cn(
              profileOutlineButtonClassName,
              'h-9 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto',
            )}
          >
            <KeyRound className="size-3.5" />
            Ubah Password
          </Button>
        ) : null
      }
    >
      {isOAuthOnly && (
        <p className="mb-4 flex items-start gap-3 rounded-xl bg-surface p-4 text-[15px] text-ink">
          <Info className="mt-0.5 size-5 shrink-0 text-ink-soft" />
          Akun ini masuk lewat Google, jadi tidak memakai password.
        </p>
      )}

      {isChangingPassword ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="animate-in space-y-4 rounded-xl bg-surface p-4 duration-300 fade-in slide-in-from-top-1 md:p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <KeyRound className="size-4 text-ink-soft" />
              Ubah Password
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Tutup"
              className="size-8 cursor-pointer rounded-full text-ink-soft hover:bg-card"
              onClick={() => setIsChangingPassword(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          {passwordField('currentPassword', 'Password Saat Ini')}
          <div className="grid gap-4 md:grid-cols-2">
            {passwordField(
              'newPassword',
              'Password Baru',
              'Minimal 8 karakter.',
            )}
            {passwordField('confirmPassword', 'Konfirmasi Password Baru')}
          </div>
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isSaving}
              className={cn(profilePrimaryButtonClassName, 'h-10 px-5')}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Simpan Password
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {!isOAuthOnly && (
            <SecurityRow
              icon={<Lock className="size-5" strokeWidth={1.75} />}
              title="Password"
              subtitle="••••••••••••"
              status={
                <CheckCircle
                  className="size-5 shrink-0 text-brand"
                  aria-label="Aktif"
                />
              }
            />
          )}
          <SecurityRow
            icon={<MonitorSmartphone className="size-5" strokeWidth={1.75} />}
            title="Login Terakhir"
            subtitle={isPending ? 'Memuat...' : loginDate}
            status={
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[15px] text-ink-soft">
                <span className="size-2 rounded-full bg-[#3f8f63]" />
                Aktif
              </span>
            }
          />
        </div>
      )}
    </ProfileSection>
  );
}
