import { ChatShell } from '@/components/chat/chat-shell';
import { SellerHeader } from '@/components/seller/seller-header';
import { requireSeller } from '@/lib/auth/auth-page-helper';

export default async function SellerLiveChatPage() {
  await requireSeller();

  return (
    <main className="flex flex-1 flex-col">
      <SellerHeader
        title="Chat Pembeli"
        subtitle="Percakapan langsung dengan pelanggan"
      />
      <section className="flex flex-1 flex-col px-4 py-5 md:px-8">
        <ChatShell
          variant="seller"
          className="h-[calc(100dvh-11rem)] min-h-[520px] ring-1 ring-border"
        />
      </section>
    </main>
  );
}
