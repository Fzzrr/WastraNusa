import { ChatShell } from '@/components/chat/chat-shell';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

type ChatPageProps = {
  searchParams: Promise<{
    c?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Pesan',
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  await requireUser();
  const { c } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 lg:px-8">
      <h1 className="mb-6 animate-in text-[clamp(2rem,3.6vw,3rem)] leading-tight font-semibold tracking-[-0.03em] text-ink duration-500 fade-in slide-in-from-bottom-2">
        Pesan
      </h1>

      {/* Header (5rem) + page padding + title block ≈ 13rem above the shell. */}
      <ChatShell
        variant="buyer"
        initialConversationId={c}
        className="h-[calc(100dvh-13rem)] min-h-[520px] animate-in duration-500 fade-in slide-in-from-bottom-2"
      />
    </main>
  );
}
