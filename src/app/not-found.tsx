import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { NotFoundContent } from '@/components/not-found-content';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f3ec] text-[#2d4f3f]">
      <Header homeHref="/" />
      <NotFoundContent />
      <Footer />
    </div>
  );
}
