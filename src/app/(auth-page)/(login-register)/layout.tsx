import Image from 'next/image';
import Link from 'next/link';

type LayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#e8e0d0]">
      {/* Left: form panel — form sits slightly above center, left-aligned with padding */}
      <div className="flex w-full flex-col lg:w-[60%] relative">
        {/* Logo top-left - Absolute positioning to avoid impacting flex center */}
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

        {/* Form — centered vertically, left-padded like design */}
        <div className="flex flex-1 items-center justify-center px-10">
          <div className="w-full max-w-[345px]">{children}</div>
        </div>
      </div>

      {/* Right: image panel with dark green tinted overlay (no fade) */}
      <div className="relative hidden lg:block lg:w-[40%]">
        <Image
          src="/auth-cover.jpg"
          alt="WastraNusa Cover"
          fill
          priority
          style={{ objectPosition: '70% 10%' }}
          className="object-cover"
          sizes="(max-width: 1024px) 0vw, 40vw"
        />
        {/* Dark green tinted overlay matching the design */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 99, 71, 0.45)' }}
        />
      </div>
    </div>
  );
}
