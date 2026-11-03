import { ChatFloatingWidget } from '@/components/chat/chat-floating-widget';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'WastraNusa',
  description: 'Explorasi Budaya Wastra Nusantara',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${plusJakartaSans.className} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <ChatFloatingWidget />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
