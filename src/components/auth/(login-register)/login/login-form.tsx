'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';

import { GoogleButton } from '../google-button';

const loginSchema = z.object({
  email: z.string().email({ message: 'Masukkan alamat email yang valid.' }),
  password: z.string().min(1, { message: 'Password wajib diisi.' }),
});

type LoginValues = z.infer<typeof loginSchema>;

/**
 * better-auth also answers 403 for reasons other than an unverified email
 * (e.g. an untrusted origin), so map by error code instead of status.
 */
function getSignInErrorMessage(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case 'EMAIL_NOT_VERIFIED':
      return 'Verifikasi email Anda terlebih dahulu sebelum masuk.';
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'Email atau password salah';
  }
  if (error.message?.toLowerCase().includes('origin')) {
    return 'Login ditolak karena alamat situs ini belum diizinkan oleh server.';
  }
  return error.message || 'Email atau password salah';
}

// Every role starts on the landing page; admins and sellers reach their
// panels from the header.
const DEFAULT_LANDING_PAGE = '/';

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginValues) => {
    const { error: signInError } = await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          queryClient.clear();
          // A page that sent the user to log in still gets them back.
          router.push(redirectTo ?? DEFAULT_LANDING_PAGE);
        },
      },
    );

    if (signInError) {
      setError('root', { message: getSignInErrorMessage(signInError) });
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-8 text-[clamp(2rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
        Masuk
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Email */}
        <Field data-invalid={!!errors.email} className="gap-1">
          <FieldLabel
            htmlFor="email"
            className="text-[15px] font-medium text-ink"
          >
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...register('email')}
            className="h-12 rounded-xl border-border bg-card px-4 text-base text-ink focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
          />
          <FieldError className="text-[13px] font-medium leading-none">
            {errors.email?.message}
          </FieldError>
        </Field>

        {/* Password */}
        <Field data-invalid={!!errors.password} className="gap-1">
          <FieldLabel
            htmlFor="password"
            className="text-[15px] font-medium text-ink"
          >
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className="h-12 rounded-xl border-border bg-card px-4 text-base text-ink focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
          />
          <FieldError className="text-[13px] font-medium leading-none">
            {errors.password?.message}
          </FieldError>
        </Field>

        {/* Error + Forgot (same row, above Sign In button) */}
        <div className="flex items-center justify-between text-[13px] min-h-[0.75rem]">
          <div className="flex-1">
            {errors.root && (
              <FieldError className="font-medium leading-none">
                {errors.root.message}
              </FieldError>
            )}
          </div>
          <Link
            href="/forgot-password"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        {/* Sign In */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-full bg-brand text-base font-semibold text-on-field hover:bg-brand-strong mt-1"
        >
          {isSubmitting ? 'Sedang masuk...' : 'Masuk'}
        </Button>
      </form>

      {/* Google — no divider, just directly below */}
      <div className="mt-3">
        <GoogleButton
          label="Lanjutkan dengan Google"
          callbackURL={redirectTo}
        />
      </div>

      {/* Register link */}
      <p className="mt-8 text-center text-[15px] text-ink-soft">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}
