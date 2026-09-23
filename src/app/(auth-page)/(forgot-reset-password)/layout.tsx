import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ForgotResetPasswordLayout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#e8e0d0] flex flex-col">
      {/* Logo - Absolute positioning to avoid impacting flex center */}
      <div className="absolute left-8 top-6 z-10 md:left-10">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <Image
            src="/logo.png"
            alt="WastraNusa"
            width={60}
            height={60}
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-[#2d2318]">
            WastraNusa
          </span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-10">
        <div className="w-full" style={{ maxWidth: '345px' }}>
          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
