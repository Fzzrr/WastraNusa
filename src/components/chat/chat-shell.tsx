'use client';

import { ChatConversationList } from '@/components/chat/chat-conversation-list';
import { ChatThread } from '@/components/chat/chat-thread';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useConversations } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { MessagesSquare } from 'lucide-react';
import { useState } from 'react';

export interface ChatShellProps {
  variant?: 'seller' | 'buyer';
  initialConversationId?: string;
}

export function ChatShell({
  variant = 'buyer',
  initialConversationId,
}: ChatShellProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Keep caches fresh from server-sent events while this view is mounted.
  useChatStream();

  const { data: conversations, isLoading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null,
  );

  const hasSelection = !!selectedId;

  return (
    <div
      className={cn(
        'flex h-[calc(100dvh-6rem)] min-h-0 overflow-hidden rounded-2xl bg-[#fffdfa] ring-1 ring-[#ebe3d6]',
        variant === 'seller' &&
          'shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)]',
      )}
    >
      {/* Left pane: conversation list */}
      <aside
        className={cn(
          'flex min-h-0 w-full flex-col border-r border-[#efe8dd] md:w-80 md:shrink-0 lg:w-96',
          hasSelection ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="border-b border-[#efe8dd] px-4 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#2f4f3f]">
            <MessagesSquare className="size-5 text-[#8a6a3a]" />
            Pesan
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChatConversationList
            conversations={conversations ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isLoading={isLoading}
          />
        </div>
      </aside>

      {/* Right pane: active thread */}
      <div
        className={cn(
          'min-h-0 flex-1 flex-col',
          hasSelection ? 'flex' : 'hidden md:flex',
        )}
      >
        {selectedId && currentUserId ? (
          <ChatThread
            conversationId={selectedId}
            currentUserId={currentUserId}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#f4efe5] px-6 text-center">
            <MessagesSquare className="size-10 text-[#c9bda6]" />
            <p className="text-sm font-medium text-[#2f4f3f]">
              Pilih percakapan
            </p>
            <p className="text-xs text-[#9a8f80]">
              Pilih percakapan di sebelah kiri untuk mulai mengobrol.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
