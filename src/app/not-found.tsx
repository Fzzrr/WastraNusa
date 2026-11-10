import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { NotFoundContent } from '@/components/not-found-content';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-ground text-ink">
      <Header homeHref="/" />
      <NotFoundContent />
      <Footer />
    </div>
  );
}
