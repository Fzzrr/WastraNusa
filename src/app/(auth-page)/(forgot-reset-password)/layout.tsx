import Image from '@/components/ui/image';
import Link from 'next/link';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ForgotResetPasswordLayout({ children }: LayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-ground">
      {/* Logo sits in the flow so the form can never run under it. */}
      <div className="px-8 pt-6 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <Image
            src="/logo.png"
            alt="WastraNusa"
            width={60}
            height={60}
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-ink">
            WastraNusa
          </span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
        <div className="w-full" style={{ maxWidth: '380px' }}>
          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
