'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/types/chat';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});
const weekdayFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'short',
});
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

/** Short, chat-list style timestamp: time today, weekday this week, else date. */
function formatShortTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return timeFormatter.format(date);

  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 7) return weekdayFormatter.format(date);

  return dateFormatter.format(date);
}

function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full bg-[#eee2d0]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-28 bg-[#eee2d0]" />
        <Skeleton className="h-3 w-40 bg-[#f2ede4]" />
      </div>
    </div>
  );
}

export function ChatConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div
        className="flex flex-col"
        role="list"
        aria-label="Memuat daftar percakapan"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <ConversationRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
        <p className="text-sm font-medium text-[#2f4f3f]">
          Belum ada percakapan
        </p>
        <p className="text-xs text-[#9a8f80]">
          Percakapan Anda akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div role="list" className="flex flex-col">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        const { otherParticipant, lastMessage, unreadCount } = conversation;

        return (
          <button
            key={conversation.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(conversation.id)}
            aria-current={isSelected}
            className={cn(
              'flex w-full items-center gap-3 border-b border-[#f0ebe1] px-4 py-3 text-left transition-colors',
              isSelected ? 'bg-[#e3ece5]' : 'cursor-pointer hover:bg-[#f4efe5]',
            )}
          >
            <Avatar size="lg" className="shrink-0">
              {otherParticipant.image ? (
                <AvatarImage
                  src={otherParticipant.image}
                  alt={otherParticipant.name}
                />
              ) : null}
              <AvatarFallback className="bg-[#e3ece5] text-[#2f5543]">
                {getInitials(otherParticipant.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'truncate text-sm text-[#2f3a33]',
                    unreadCount > 0 ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {otherParticipant.name}
                </span>
                <span className="shrink-0 text-[11px] text-[#9a8f80]">
                  {formatShortTime(conversation.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'truncate text-xs',
                    unreadCount > 0
                      ? 'font-medium text-[#5f5a52]'
                      : 'text-[#9a8f80]',
                  )}
                >
                  {lastMessage?.content ?? 'Belum ada pesan'}
                </span>
                {unreadCount > 0 ? (
                  <Badge className="shrink-0 bg-[#2f5f49] text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
