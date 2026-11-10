'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Alamat email tidak valid.'),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/reset-password',
      });

      if (authError) {
        setError(authError.message || 'Gagal mengirim link reset password.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('Terjadi kesalahan tak terduga.');
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <p className="text-base text-ink">
          Link reset password telah dikirim ke alamat email Anda.
        </p>
        <p className="text-[13px] text-ink/70">
          Periksa kotak masuk (dan folder spam) Anda, lalu ikuti petunjuknya
          untuk mengatur ulang password.
        </p>
        <Button
          asChild
          className="w-full h-12 rounded-full bg-brand text-base font-semibold text-on-field hover:bg-brand-strong"
        >
          <Link href="/login">Kembali ke Halaman Masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Field data-invalid={!!errors.email} className="gap-1">
          <FieldLabel
            htmlFor="email"
            className="text-[15px] font-medium text-ink"
          >
            Alamat Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="name@example.com"
            className="h-12 rounded-xl border-border bg-card px-4 text-base text-ink focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
          />
          <FieldError className="text-[13px] font-medium leading-none">
            {errors.email?.message}
          </FieldError>
        </Field>
      </div>

      {error && (
        <div className="min-h-[1rem] py-0.5">
          <FieldError className="text-[13px] font-medium leading-none">
            {error}
          </FieldError>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-full bg-brand text-base font-semibold text-on-field hover:bg-brand-strong mt-0.5"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
        </Button>

        <p className="mt-6 text-center text-[15px] text-ink-soft">
          Ingat password Anda?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </form>
  );
}
