'use client';

import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatMessageBubble } from '@/components/chat/chat-message-bubble';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversation } from '@/hooks/use-conversations';
import type { ChatParticipant } from '@/types/chat';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

function ParticipantHeader({
  participant,
  onBack,
}: {
  participant: ChatParticipant | null;
  onBack?: () => void;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-[#efe8dd] bg-[#fffdfa] px-3 py-3 sm:px-4">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="Kembali ke daftar percakapan"
          className="shrink-0 cursor-pointer text-[#5f5a52] hover:bg-[#f4efe5] hover:text-[#2f4f3f] md:hidden"
        >
          <ArrowLeft className="size-4" />
        </Button>
      ) : null}
      <Avatar>
        {participant?.image ? (
          <AvatarImage src={participant.image} alt={participant.name} />
        ) : null}
        <AvatarFallback className="bg-[#e3ece5] text-[#2f5543]">
          {participant ? getInitials(participant.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#2f4f3f]">
          {participant?.name ?? 'Percakapan'}
        </p>
      </div>
    </header>
  );
}

export function ChatThread({
  conversationId,
  currentUserId,
  onBack,
}: {
  conversationId: string;
  currentUserId: string;
  onBack?: () => void;
}) {
  const { data, isLoading, isError, error } = useConversation(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages;

  // Auto-scroll to the latest message whenever the thread changes or grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length, conversationId]);

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-[#f4efe5]">
      <ParticipantHeader
        participant={data?.otherParticipant ?? null}
        onBack={onBack}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-48 self-start rounded-2xl bg-[#e7ddcd]" />
            <Skeleton className="h-10 w-56 self-end rounded-2xl bg-[#dfe8e0]" />
            <Skeleton className="h-10 w-40 self-start rounded-2xl bg-[#e7ddcd]" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-[#b45843]">
              Gagal memuat percakapan.
            </p>
            <p className="text-xs text-[#9a8f80]">
              {error instanceof Error
                ? error.message
                : 'Terjadi kesalahan tak terduga.'}
            </p>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <MessageCircle className="size-8 text-[#8a6a3a]" />
            <p className="text-sm font-medium text-[#2f4f3f]">
              Mulai percakapan
            </p>
            <p className="text-xs text-[#9a8f80]">
              Kirim pesan pertama Anda di bawah ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatComposer conversationId={conversationId} />
    </section>
  );
}
