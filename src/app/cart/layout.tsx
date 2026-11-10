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
      <main className="flex-1 container mx-auto px-4 py-8 md:py-10 max-w-[1320px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
