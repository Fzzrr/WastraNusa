import { ChatShell } from '@/components/chat/chat-shell';
import { SellerHeader } from '@/components/seller/seller-header';
import { requireSeller } from '@/lib/auth/auth-page-helper';

export default async function SellerLiveChatPage() {
  await requireSeller();

  return (
    <main className="flex flex-1 flex-col">
      <SellerHeader
        title="Live Chat"
        subtitle="Percakapan langsung dengan pelanggan"
      />
      <section className="flex min-h-[560px] flex-1 flex-col">
        <ChatShell variant="seller" />
      </section>
    </main>
  );
}
