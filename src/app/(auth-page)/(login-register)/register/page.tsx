import { RegisterForm } from '@/components/auth/(login-register)/register/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
