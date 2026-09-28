import { ForgotPasswordForm } from '@/components/auth/(forget-reset-password)/forgot-password/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2318]">
          Lupa Password
        </h1>
        <p className="mt-2 text-xs text-[#7a6e62]">
          Masukkan email terdaftar untuk menerima link pemulihan.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
