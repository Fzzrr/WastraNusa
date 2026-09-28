'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authClient } from '@/lib/auth/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod/v3';

import { GoogleButton } from '../google-button';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const YEARS = Array.from({ length: 80 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'Nama depan minimal 2 karakter.' }),
  phone: z
    .string()
    .min(10, { message: 'Nomor telepon minimal 10 digit.' })
    .regex(/^\d+$/, { message: 'Nomor telepon hanya boleh berisi angka.' }),
  email: z.string().email({ message: 'Masukkan alamat email yang valid.' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter.' }),
  day: z.string().min(1, { message: 'Tanggal wajib dipilih.' }),
  month: z.string().min(1, { message: 'Bulan wajib dipilih.' }),
  year: z.string().min(1, { message: 'Tahun wajib dipilih.' }),
  gender: z.enum(['male', 'female'], { message: 'Pilih jenis kelamin.' }),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      phone: '',
      email: '',
      password: '',
      day: '',
      month: '',
      year: '',
      gender: 'female',
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    // Month index from name
    const monthIndex = MONTHS.indexOf(data.month);
    const birthDate = new Date(Number(data.year), monthIndex, Number(data.day));

    const { error: signUpError } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.firstName,
      phoneNumber: data.phone,
      birthDate: birthDate,
      gender: data.gender,
      callbackURL: '/login',
    });

    if (signUpError) {
      setError('root', {
        message: signUpError.message || 'Pendaftaran gagal. Silakan coba lagi.',
      });
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-5 text-2xl font-bold text-[#2d2318]">
        Daftar ke WastraNusa
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {!isSuccess && (
          <>
            {/* First name */}
            <Field data-invalid={!!errors.firstName} className="gap-1">
              <FieldLabel
                htmlFor="firstName"
                className="text-xs font-sm text-[#2d2318]"
              >
                Nama Depan
              </FieldLabel>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Nama depan"
                {...register('firstName')}
                className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
              />
              <FieldError className="text-[10px] font-medium leading-none">
                {errors.firstName?.message}
              </FieldError>
            </Field>

            {/* Phone */}
            <Field data-invalid={!!errors.phone} className="gap-1">
              <FieldLabel
                htmlFor="phone"
                className="text-xs font-sm text-[#2d2318]"
              >
                Nomor Telepon
              </FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
                {...register('phone')}
                onInput={(e) =>
                  (e.currentTarget.value = e.currentTarget.value.replace(
                    /[^0-9]/g,
                    '',
                  ))
                }
                className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
              />
              <FieldError className="text-[10px] font-medium leading-none">
                {errors.phone?.message}
              </FieldError>
            </Field>

            {/* Email */}
            <Field data-invalid={!!errors.email} className="gap-1">
              <FieldLabel
                htmlFor="email"
                className="text-xs font-sm text-[#2d2318]"
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
              <FieldError className="text-[10px] font-medium leading-none">
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
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
                className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
              />
              <FieldError className="text-[10px] font-medium leading-none">
                {errors.password?.message}
              </FieldError>
            </Field>

            {/* Date of Birth */}
            <Field
              data-invalid={!!(errors.day || errors.month || errors.year)}
              className="gap-1"
            >
              <FieldLabel className="text-xs font-sm text-[#2d2318]">
                Tanggal Lahir
              </FieldLabel>
              <div className="flex gap-2">
                <Controller
                  name="day"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-[#c8bfb0] bg-transparent text-[#2d2318] focus:ring-[#8a7a6a]">
                        <SelectValue placeholder="Tanggal" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-[#c8bfb0] bg-transparent text-[#2d2318] focus:ring-[#8a7a6a]">
                        <SelectValue placeholder="Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-[#c8bfb0] bg-transparent text-[#2d2318] focus:ring-[#8a7a6a]">
                        <SelectValue placeholder="Tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <FieldError className="text-[10px] font-medium leading-none">
                {(errors.day || errors.month || errors.year) &&
                  'Lengkapi tanggal lahir Anda.'}
              </FieldError>
            </Field>

            {/* Gender */}
            <Field data-invalid={!!errors.gender} className="gap-1">
              <div className="flex gap-2.5 text-xs text-[#2d2318] mt-0.5">
                {[
                  { value: 'female', label: 'Perempuan' },
                  { value: 'male', label: 'Laki-laki' },
                ].map((gender) => (
                  <label
                    key={gender.value}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={gender.value}
                      {...register('gender')}
                      className="accent-[#3d2e1e] w-3 h-3"
                    />
                    {gender.label}
                  </label>
                ))}
              </div>
              <FieldError className="text-[10px] font-medium leading-none">
                {errors.gender?.message}
              </FieldError>
            </Field>
          </>
        )}

        {isSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Berhasil!</AlertTitle>
            <AlertDescription>
              Pendaftaran berhasil! Email verifikasi telah dikirim ke kotak
              masuk Anda. Verifikasi email Anda terlebih dahulu sebelum masuk.
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        <div className="min-h-[0.5rem] py-0">
          {errors.root && (
            <FieldError className="text-xs font-medium leading-none">
              {errors.root.message}
            </FieldError>
          )}
        </div>

        {/* Submit */}
        <Button
          type={isSuccess ? 'button' : 'submit'}
          disabled={isSubmitting}
          onClick={isSuccess ? () => router.push('/login') : undefined}
          className="w-full h-11 bg-[#3d2e1e] hover:bg-[#2d2015] text-[#f0ebe3] font-semibold rounded-sm"
        >
          {isSuccess
            ? 'Ke Halaman Masuk'
            : isSubmitting
              ? 'Sedang mendaftar...'
              : 'Daftar'}
        </Button>
      </form>

      {!isSuccess && (
        <>
          <div className="mt-3">
            <GoogleButton label="Lanjutkan dengan Google" />
          </div>

          <p className="mt-4 text-center text-xs text-[#7a6e62]">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="text-[#c07a4a] hover:underline font-medium"
            >
              Masuk
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
