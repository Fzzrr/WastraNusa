import { ResetPasswordForm } from '@/components/auth/(forget-reset-password)/reset-password/reset-password-form';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, error } = await searchParams;

  return (
    <>
      <div className="text-center">
        <h1 className="text-[clamp(2rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
          Atur Ulang Password
        </h1>
        <p className="mt-3 text-base text-ink-soft">
          Masukkan password baru untuk mengamankan akun Anda.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <ResetPasswordForm
          token={typeof token === 'string' ? token : undefined}
          error={typeof error === 'string' ? error : undefined}
        />
      </div>
    </>
  );
}
