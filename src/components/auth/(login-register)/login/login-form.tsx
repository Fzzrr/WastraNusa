'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/auth-client';
import { isAdmin, isSeller } from '@/lib/auth/roles';
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

function getDefaultLandingPage(role?: string | null): string {
  if (isAdmin(role)) return '/admin/dashboard';
  if (isSeller(role)) return '/seller/dashboard';
  return '/encyclopedia';
}

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
        onSuccess: async () => {
          queryClient.clear();
          const session = await authClient.getSession();
          router.push(
            redirectTo ?? getDefaultLandingPage(session.data?.user.role),
          );
        },
      },
    );

    if (signInError) {
      setError('root', { message: getSignInErrorMessage(signInError) });
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-5 text-2xl font-bold text-[#2d2318]">
        Masuk ke WastraNusa
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Email */}
        <Field data-invalid={!!errors.email} className="gap-1">
          <FieldLabel
            htmlFor="email"
            className="text-xs font-sm text-[#2d2318] text-bold"
          >
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...register('email')}
            className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
          />
          <FieldError className="text-xs font-medium leading-none">
            {errors.email?.message}
          </FieldError>
        </Field>

        {/* Password */}
        <Field data-invalid={!!errors.password} className="gap-1">
          <FieldLabel
            htmlFor="password"
            className="text-xs font-sm text-[#2d2318]"
          >
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
          />
          <FieldError className="text-xs font-medium leading-none">
            {errors.password?.message}
          </FieldError>
        </Field>

        {/* Error + Forgot (same row, above Sign In button) */}
        <div className="flex items-center justify-between text-xs min-h-[0.75rem]">
          <div className="flex-1">
            {errors.root && (
              <FieldError className="font-medium leading-none">
                {errors.root.message}
              </FieldError>
            )}
          </div>
          <Link
            href="/forgot-password"
            className="text-[#8b5530] hover:underline font-medium"
          >
            Lupa password?
          </Link>
        </div>

        {/* Sign In */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-[#3d2e1e] hover:bg-[#2d2015] text-[#f0ebe3] font-semibold rounded-sm mt-1"
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
      <p className="mt-5 text-center text-xs text-[#6a6056]">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="text-[#8b5530] hover:underline font-medium"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}
