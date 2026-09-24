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
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
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
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            setError('root', {
              message: 'Please verify your email address before signing in.',
            });
          }
        },
        onSuccess: async () => {
          queryClient.clear();
          const session = await authClient.getSession();
          if (session.data?.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/encyclopedia');
          }
        },
      },
    );

    if (signInError && signInError.status !== 403) {
      setError('root', {
        message: signInError.message || 'Wrong email or password',
      });
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-[#7a6e62]">Start your journey</p>
      <h1 className="mt-1 mb-5 text-2xl font-bold text-[#2d2318]">
        Sign In to WastraNusa
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
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className="h-10 rounded-sm border-[#c8bfb0] bg-transparent focus-visible:ring-0.5 focus-visible:ring-[#8a7a6a] text-[#2d2318]"
          />
          <FieldError className="text-[10px] font-medium leading-none">
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
            className="text-[#c07a4a] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-[#3d2e1e] hover:bg-[#2d2015] text-[#f0ebe3] font-semibold rounded-sm mt-1"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* Google — no divider, just directly below */}
      <div className="mt-3">
        <GoogleButton label="Continue with Google" />
      </div>

      {/* Register link */}
      <p className="mt-5 text-center text-xs text-[#7a6e62]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-[#c07a4a] hover:underline font-medium"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
