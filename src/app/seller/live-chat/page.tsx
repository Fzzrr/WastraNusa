import { SellerHeader } from '@/components/seller/seller-header';
import { requireSeller } from '@/lib/auth/auth-page-helper';
import { MessageCircle } from 'lucide-react';

export default async function SellerLiveChatPage() {
  await requireSeller();

  return (
    <main className="flex flex-col">
      <SellerHeader
        title="Live Chat"
        subtitle="Layanan percakapan langsung dengan pelanggan"
      />
      <section className="flex flex-1 items-center justify-center bg-[#eef3e5] px-5 py-16 md:px-8">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[#d8e0cc] bg-white px-8 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#4a6b3a]/10 text-[#4a6b3a]">
            <MessageCircle className="size-7" />
          </span>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">Segera hadir</h2>
          <p className="text-sm text-[#7d8a70]">
            Fitur Live Chat masih dalam pengembangan. Anda akan dapat membalas
            pertanyaan pelanggan secara langsung di sini.
          </p>
        </div>
      </section>
    </main>
  );
}
