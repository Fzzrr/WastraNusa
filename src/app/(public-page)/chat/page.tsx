import { ChatShell } from '@/components/chat/chat-shell';
import { requireUser } from '@/lib/auth/auth-page-helper';
import { MessagesSquare } from 'lucide-react';

type ChatPageProps = {
  searchParams: Promise<{
    c?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  await requireUser();
  const { c } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[1320px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_40%)] px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-5 flex animate-in items-center gap-3 duration-500 fade-in slide-in-from-bottom-2">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d] shadow-[0_6px_14px_-8px_rgba(47,75,61,0.8)]">
          <MessagesSquare className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-[#2f4f3f]">Pesan</h1>
          <p className="text-sm text-[#9a8f80]">
            Ngobrol langsung dengan penjual seputar produk dan pesanan Anda
          </p>
        </div>
      </div>

      {/* Header (5rem) + page padding + title block ≈ 13rem above the shell. */}
      <ChatShell
        variant="buyer"
        initialConversationId={c}
        className="h-[calc(100dvh-13rem)] min-h-[520px] animate-in duration-500 fade-in slide-in-from-bottom-2"
      />
    </main>
  );
}
