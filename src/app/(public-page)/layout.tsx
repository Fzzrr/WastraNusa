import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ground text-ink">
      <Header homeHref="/" />
      {children}
      <Footer />
    </div>
  );
}
