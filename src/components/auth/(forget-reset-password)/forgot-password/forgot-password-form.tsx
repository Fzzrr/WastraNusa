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
        <p className="text-sm text-[#2d2318]">
          Link reset password telah dikirim ke alamat email Anda.
        </p>
        <p className="text-xs text-[#2d2318]/70">
          Periksa kotak masuk (dan folder spam) Anda, lalu ikuti petunjuknya
          untuk mengatur ulang password.
        </p>
        <Button
          asChild
          className="w-full h-11 bg-[#3d2e1e] hover:bg-[#2d2015] text-[#f0ebe3] font-semibold rounded-sm shadow-sm"
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
            className="text-xs font-sm text-[#2d2318]"
          >
            Alamat Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="name@example.com"
            className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
          />
          <FieldError className="text-[10px] font-medium leading-none">
            {errors.email?.message}
          </FieldError>
        </Field>
      </div>

      {error && (
        <div className="min-h-[1rem] py-0.5">
          <FieldError className="text-xs font-medium leading-none">
            {error}
          </FieldError>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-[#3d2e1e] hover:bg-[#2d2015] text-[#f0ebe3] font-semibold rounded-sm mt-0.5"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
        </Button>

        <p className="mt-4 text-center text-xs text-[#7a6e62]">
          Ingat password Anda?{' '}
          <Link
            href="/login"
            className="text-[#c07a4a] hover:underline font-medium"
          >
            Masuk
          </Link>
        </p>
      </div>
    </form>
  );
}
