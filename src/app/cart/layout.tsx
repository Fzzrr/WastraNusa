import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import React from 'react';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4efe6] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.75),transparent_45%)]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-10 max-w-[1320px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
