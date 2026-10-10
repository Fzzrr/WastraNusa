import { ChatShell } from '@/components/chat/chat-shell';
import { requireUser } from '@/lib/auth/auth-page-helper';

type ChatPageProps = {
  searchParams: Promise<{
    c?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  await requireUser();
  const { c } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold text-[#2f4f3f]">Pesan</h1>
      <div className="flex min-h-[620px] flex-col">
        <ChatShell variant="buyer" initialConversationId={c} />
      </div>
    </main>
  );
}
