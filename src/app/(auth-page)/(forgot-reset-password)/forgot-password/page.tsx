import { ForgotPasswordForm } from '@/components/auth/(forget-reset-password)/forgot-password/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-[clamp(2rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
          Lupa Password
        </h1>
        <p className="mt-3 text-base text-ink-soft">
          Masukkan email terdaftar untuk menerima link pemulihan.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
