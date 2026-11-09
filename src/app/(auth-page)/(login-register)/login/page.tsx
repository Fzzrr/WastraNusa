import { LoginForm } from '@/components/auth/(login-register)/login/login-form';
import { getSafeRedirect } from '@/lib/auth/redirect';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <LoginForm redirectTo={getSafeRedirect(redirect)} />;
}
