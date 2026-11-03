'use client';

import { formatShortTime, getInitials } from '@/components/chat/chat-format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/types/chat';
import { Inbox, Search, X } from 'lucide-react';
import { useState } from 'react';

type Filter = 'all' | 'unread';

function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-11 shrink-0 rounded-full bg-[#eee2d0]" />
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
  currentUserId,
  onSelect,
  isLoading,
}: {
  conversations: ConversationSummary[];
  selectedId: string | null;
  currentUserId?: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const unreadTotal = conversations.filter((c) => c.unreadCount > 0).length;
  const normalizedQuery = query.trim().toLowerCase();
  const visible = conversations.filter(
    (c) =>
      (filter === 'all' || c.unreadCount > 0) &&
      c.otherParticipant.name.toLowerCase().includes(normalizedQuery),
  );

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'unread', label: 'Belum dibaca', count: unreadTotal },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2.5 border-b border-[#efe8dd] px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#b3aa9e]" />
          <label htmlFor="chat-search" className="sr-only">
            Cari percakapan
          </label>
          <input
            id="chat-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama..."
            className="h-9 w-full rounded-xl border border-[#e5ded5] bg-white pr-8 pl-9 text-sm text-[#2f3a33] transition-[border-color,box-shadow] placeholder:text-[#b3aa9e] focus:outline-none focus-visible:border-[#3a5a4a] focus-visible:ring-3 focus-visible:ring-[#3a5a4a]/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Hapus pencarian"
              className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-[#9a8f80] hover:bg-[#f4efe5] hover:text-[#2f4f3f]"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div
          role="tablist"
          aria-label="Filter percakapan"
          className="flex gap-1 rounded-xl bg-[#f4efe5] p-1"
        >
          {filters.map((item) => {
            const isActive = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(item.id)}
                className={cn(
                  'inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-white shadow-[0_6px_14px_-8px_rgba(47,95,73,0.8)]'
                    : 'text-[#6f6a62] hover:bg-white/70 hover:text-[#2f5f49]',
                )}
              >
                {item.label}
                {item.count ? (
                  <span
                    className={cn(
                      'min-w-4 rounded-full px-1 text-[10px] leading-4 tabular-nums',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#b08a5e] text-white',
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div role="list" aria-label="Memuat daftar percakapan">
            {Array.from({ length: 6 }).map((_, index) => (
              <ConversationRowSkeleton key={index} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-[#f5ead3] text-[#b08a5e]">
              {normalizedQuery ? (
                <Search className="size-6" />
              ) : (
                <Inbox className="size-6" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#3d4f45]">
                {normalizedQuery
                  ? 'Tidak ditemukan'
                  : filter === 'unread'
                    ? 'Semua pesan sudah dibaca'
                    : 'Belum ada percakapan'}
              </p>
              <p className="mt-1 text-xs text-[#9a8f80]">
                {normalizedQuery
                  ? `Tidak ada percakapan dengan "${query.trim()}".`
                  : filter === 'unread'
                    ? 'Tidak ada pesan baru untuk saat ini.'
                    : 'Percakapan Anda akan muncul di sini.'}
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col p-2">
            {visible.map((conversation) => {
              const isSelected = conversation.id === selectedId;
              const { otherParticipant, lastMessage, unreadCount } =
                conversation;
              const isUnread = unreadCount > 0;
              const isOwnLast =
                !!lastMessage && lastMessage.senderId === currentUserId;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={cn(
                      'group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                      isSelected
                        ? 'bg-[#e3ece5] shadow-[inset_0_0_0_1px_rgba(47,95,73,0.12)]'
                        : 'hover:bg-[#f4efe5]',
                    )}
                  >
                    {isSelected ? (
                      <span className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#2f5f49] to-[#3f7359]" />
                    ) : null}

                    <span className="relative shrink-0">
                      <Avatar size="lg" className="size-11">
                        {otherParticipant.image ? (
                          <AvatarImage
                            src={otherParticipant.image}
                            alt={otherParticipant.name}
                          />
                        ) : null}
                        <AvatarFallback
                          className={cn(
                            'font-semibold transition-colors',
                            isSelected
                              ? 'bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d]'
                              : 'bg-[#e3ece5] text-[#2f5543] group-hover:bg-[#d8e5db]',
                          )}
                        >
                          {getInitials(otherParticipant.name)}
                        </AvatarFallback>
                      </Avatar>
                      {isUnread ? (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-[#b08a5e] ring-2 ring-[#fffdf8]" />
                      ) : null}
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-sm text-[#2f3a33]',
                            isUnread ? 'font-bold' : 'font-semibold',
                          )}
                        >
                          {otherParticipant.name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 text-[11px] tabular-nums',
                            isUnread
                              ? 'font-semibold text-[#b08a5e]'
                              : 'text-[#a39784]',
                          )}
                        >
                          {formatShortTime(conversation.lastMessageAt)}
                        </span>
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-xs',
                            isUnread
                              ? 'font-medium text-[#4d4a44]'
                              : 'text-[#9a8f80]',
                          )}
                        >
                          {isOwnLast ? (
                            <span className="text-[#6e8276]">Anda: </span>
                          ) : null}
                          {lastMessage?.content ?? 'Belum ada pesan'}
                        </span>
                        {isUnread ? (
                          <span className="min-w-5 shrink-0 rounded-full bg-gradient-to-r from-[#2f5f49] to-[#3f7359] px-1.5 text-center text-[10px] leading-5 font-bold text-white tabular-nums">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
