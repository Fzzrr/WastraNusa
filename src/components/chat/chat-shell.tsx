'use client';

import { ChatConversationList } from '@/components/chat/chat-conversation-list';
import {
  ChatThread,
  ChatThreadPlaceholder,
} from '@/components/chat/chat-thread';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useConversations } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { MessagesSquare } from 'lucide-react';
import { useState } from 'react';

export interface ChatShellProps {
  variant?: 'seller' | 'buyer';
  initialConversationId?: string;
  /** Overrides the default height (the shell fills the remaining viewport). */
  className?: string;
}

export function ChatShell({
  variant = 'buyer',
  initialConversationId,
  className,
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
  const totalUnread = (conversations ?? []).reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );

  return (
    <div
      className={cn(
        'flex h-[calc(100dvh-6rem)] min-h-0 overflow-hidden rounded-2xl bg-[#fffdf8] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#e8dfd0]',
        className,
      )}
    >
      {/* Left pane: conversation list */}
      <aside
        className={cn(
          'min-h-0 w-full flex-col border-r border-[#efe8dd] md:flex md:w-80 md:shrink-0 lg:w-96',
          hasSelection ? 'hidden' : 'flex',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-1">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#2f4f3f]">
            <MessagesSquare className="size-5 text-[#b08a5e]" />
            Percakapan
          </h2>
          {totalUnread > 0 ? (
            <span className="rounded-full bg-[#f5ead3] px-2 py-0.5 text-[11px] font-semibold text-[#8a6a3a]">
              {totalUnread} belum dibaca
            </span>
          ) : null}
        </div>
        <ChatConversationList
          conversations={conversations ?? []}
          selectedId={selectedId}
          currentUserId={currentUserId}
          onSelect={setSelectedId}
          isLoading={isLoading}
        />
      </aside>

      {/* Right pane: active thread */}
      <div
        className={cn(
          'min-h-0 flex-1 flex-col md:flex',
          hasSelection ? 'flex' : 'hidden',
        )}
      >
        {selectedId && currentUserId ? (
          <ChatThread
            key={selectedId}
            conversationId={selectedId}
            currentUserId={currentUserId}
            variant={variant}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <ChatThreadPlaceholder />
        )}
      </div>
    </div>
  );
}
