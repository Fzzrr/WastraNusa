import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import React from 'react';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <Header />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 md:px-6 md:py-10 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
