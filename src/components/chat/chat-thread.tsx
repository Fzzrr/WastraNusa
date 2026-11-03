'use client';

import { ChatComposer } from '@/components/chat/chat-composer';
import {
  formatDayLabel,
  getDayKey,
  getInitials,
} from '@/components/chat/chat-format';
import { ChatMessageBubble } from '@/components/chat/chat-message-bubble';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversation } from '@/hooks/use-conversations';
import { cn } from '@/lib/utils';
import type { ChatParticipant, ConversationMessage } from '@/types/chat';
import { ArrowDown, ArrowLeft, MessageCircle, Store } from 'lucide-react';
import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

/** Distance from the bottom (px) still treated as "reading the latest". */
const NEAR_BOTTOM_PX = 120;

const BUYER_SUGGESTIONS = [
  'Halo, apakah produk ini masih tersedia?',
  'Apakah ukurannya bisa ditukar?',
  'Berapa lama pengirimannya?',
  'Apakah bisa custom motif?',
];

type ThreadItem =
  | { kind: 'day'; key: string; label: string }
  | {
      kind: 'message';
      message: ConversationMessage;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
    };

/** Interleave date separators and mark runs of messages from one sender. */
function buildThreadItems(messages: ConversationMessage[]): ThreadItem[] {
  const items: ThreadItem[] = [];
  messages.forEach((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const day = getDayKey(message.createdAt);
    const newDay = !prev || getDayKey(prev.createdAt) !== day;

    if (newDay) {
      items.push({
        kind: 'day',
        key: `day-${day}`,
        label: formatDayLabel(message.createdAt),
      });
    }

    items.push({
      kind: 'message',
      message,
      isFirstInGroup: newDay || prev?.senderId !== message.senderId,
      isLastInGroup:
        !next ||
        next.senderId !== message.senderId ||
        getDayKey(next.createdAt) !== day,
    });
  });
  return items;
}

function ParticipantHeader({
  participant,
  variant,
  compact,
  onBack,
}: {
  participant: ChatParticipant | null;
  variant: 'seller' | 'buyer';
  compact?: boolean;
  onBack?: () => void;
}) {
  return (
    <header
      className={cn(
        'flex items-center gap-3 border-b border-[#efe8dd] bg-[#fffdf8]/95 px-3 py-3 backdrop-blur',
        !compact && 'sm:px-5',
      )}
    >
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="Kembali ke daftar percakapan"
          className={cn(
            'shrink-0 cursor-pointer text-[#5f5a52] hover:bg-[#f4efe5] hover:text-[#2f4f3f]',
            !compact && 'md:hidden',
          )}
        >
          <ArrowLeft className="size-4" />
        </Button>
      ) : null}
      <Avatar
        size="lg"
        className="ring-2 ring-[#e8cb8d]/60 ring-offset-2 ring-offset-[#fffdf8]"
      >
        {participant?.image ? (
          <AvatarImage src={participant.image} alt={participant.name} />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] font-semibold text-[#e8cb8d]">
          {participant ? getInitials(participant.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#2f4f3f]">
          {participant?.name ?? 'Percakapan'}
        </p>
        <p className="text-xs text-[#9a8f80]">
          {variant === 'buyer' ? 'Penjual' : 'Pembeli'}
        </p>
      </div>
      {variant === 'buyer' && participant ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 cursor-pointer gap-1.5 rounded-xl border-[#e3d9c7] bg-white text-[#4d6356] transition-colors hover:border-[#2f5f49]/40 hover:bg-[#e3ece5] hover:text-[#2f5f49]"
        >
          <Link href={`/shop/${participant.id}`}>
            <Store className="size-3.5" />
            <span className={compact ? 'sr-only' : 'hidden sm:inline'}>
              Kunjungi Toko
            </span>
          </Link>
        </Button>
      ) : null}
    </header>
  );
}

export function ChatThread({
  conversationId,
  currentUserId,
  variant = 'buyer',
  compact = false,
  onBack,
}: {
  conversationId: string;
  currentUserId: string;
  variant?: 'seller' | 'buyer';
  /** Narrow layout for the floating widget: back button always visible. */
  compact?: boolean;
  onBack?: () => void;
}) {
  const { data, isLoading, isError, error } = useConversation(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const renderedCountRef = useRef(0);
  // Message count at the moment the reader scrolled away from the bottom;
  // null while they are following the latest messages.
  const [countWhenScrolledAway, setCountWhenScrolledAway] = useState<
    number | null
  >(null);

  const messages = data?.messages;
  const messageCount = messages?.length ?? 0;
  const items = useMemo(() => buildThreadItems(messages ?? []), [messages]);
  const unseenCount =
    countWhenScrolledAway === null
      ? 0
      : Math.max(0, messageCount - countWhenScrolledAway);

  const scrollToBottom = (behavior: ScrollBehavior) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    isNearBottomRef.current = true;
  };

  // New messages: follow along if the reader is at the bottom or sent it,
  // otherwise keep their scroll position (the "new messages" pill appears).
  // The shell remounts this component per conversation, so the first batch
  // always jumps straight to the latest message.
  useLayoutEffect(() => {
    const previous = renderedCountRef.current;
    renderedCountRef.current = messageCount;
    if (messageCount <= previous) return;

    const lastIsOwn = messages?.[messageCount - 1]?.senderId === currentUserId;
    if (previous === 0) {
      scrollToBottom('auto');
    } else if (isNearBottomRef.current || lastIsOwn) {
      scrollToBottom('smooth');
    }
  }, [messages, messageCount, currentUserId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    isNearBottomRef.current = nearBottom;
    if (nearBottom) {
      if (countWhenScrolledAway !== null) setCountWhenScrolledAway(null);
    } else if (countWhenScrolledAway === null) {
      setCountWhenScrolledAway(messageCount);
    }
  };

  const isEmpty =
    !isLoading && !isError && (!messages || messages.length === 0);

  return (
    <section className="relative flex h-full min-h-0 flex-1 flex-col bg-[#f4efe5]">
      <ParticipantHeader
        participant={data?.otherParticipant ?? null}
        variant={variant}
        compact={compact}
        onBack={onBack}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[radial-gradient(rgba(176,138,94,0.13)_1px,transparent_1px)] [background-size:18px_18px] px-3 pt-2 pb-4 sm:px-6"
      >
        {isLoading ? (
          <div className="flex flex-col gap-3 pt-4">
            <Skeleton className="h-10 w-48 self-start rounded-2xl bg-[#e7ddcd]" />
            <Skeleton className="h-10 w-56 self-end rounded-2xl bg-[#dfe8e0]" />
            <Skeleton className="h-14 w-64 self-start rounded-2xl bg-[#e7ddcd]" />
            <Skeleton className="h-10 w-40 self-end rounded-2xl bg-[#dfe8e0]" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-[#b04a3a]">
              Gagal memuat percakapan.
            </p>
            <p className="text-xs text-[#9a8f80]">
              {error instanceof Error
                ? error.message
                : 'Terjadi kesalahan tak terduga.'}
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#f5ead3] text-[#b08a5e]">
              <MessageCircle className="size-7" />
            </span>
            <div>
              <p className="font-semibold text-[#3d4f45]">Mulai percakapan</p>
              <p className="mt-1 max-w-xs text-sm text-[#9a8f80]">
                {variant === 'buyer'
                  ? 'Tanyakan stok, ukuran, atau detail produk langsung ke penjual.'
                  : 'Kirim pesan pertama Anda di bawah ini.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map((item) =>
              item.kind === 'day' ? (
                <div
                  key={item.key}
                  className="sticky top-2 z-10 my-3 flex justify-center"
                >
                  <span className="rounded-full bg-[#fffdf8]/95 px-3 py-1 text-[11px] font-semibold text-[#8a7a62] shadow-[0_1px_2px_rgba(60,41,15,0.08)] ring-1 ring-[#ebe3d6] backdrop-blur">
                    {item.label}
                  </span>
                </div>
              ) : (
                <ChatMessageBubble
                  key={item.message.id}
                  message={item.message}
                  isOwn={item.message.senderId === currentUserId}
                  isFirstInGroup={item.isFirstInGroup}
                  isLastInGroup={item.isLastInGroup}
                />
              ),
            )}
          </div>
        )}
      </div>

      {unseenCount > 0 ? (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 animate-in cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2f5f49] to-[#3f7359] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_-8px_rgba(47,95,73,0.9)] duration-200 fade-in zoom-in-95 hover:from-[#274e3c] hover:to-[#35644d]"
        >
          <ArrowDown className="size-3.5" />
          {unseenCount} pesan baru
        </button>
      ) : null}

      <ChatComposer
        conversationId={conversationId}
        showHint={!compact}
        suggestions={
          variant === 'buyer' && isEmpty ? BUYER_SUGGESTIONS : undefined
        }
      />
    </section>
  );
}

export function ChatThreadPlaceholder() {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 px-6 text-center',
        'bg-[#f4efe5] bg-[radial-gradient(rgba(176,138,94,0.13)_1px,transparent_1px)] [background-size:18px_18px]',
      )}
    >
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d] shadow-[0_10px_24px_-12px_rgba(47,75,61,0.9)]">
        <MessageCircle className="size-8" />
      </span>
      <div>
        <p className="font-semibold text-[#2f4f3f]">Pilih percakapan</p>
        <p className="mt-1 max-w-xs text-sm text-[#9a8f80]">
          Pilih percakapan di sebelah kiri untuk melihat dan membalas pesan.
        </p>
      </div>
    </div>
  );
}
