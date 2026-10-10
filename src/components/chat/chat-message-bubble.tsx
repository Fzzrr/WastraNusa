'use client';

import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : timeFormatter.format(date);
}

export function ChatMessageBubble({
  message,
  isOwn,
}: {
  message: ConversationMessage;
  isOwn: boolean;
}) {
  const time = formatTime(message.createdAt);
  const isRead = Boolean(message.readAt);

  return (
    <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[78%] flex-col gap-1 rounded-2xl px-3.5 py-2 text-sm shadow-[0_1px_2px_rgba(60,41,15,0.06)] sm:max-w-[70%]',
          isOwn
            ? 'rounded-br-md bg-[#2f5f49] text-white'
            : 'rounded-bl-md bg-white text-[#2f3a33] ring-1 ring-[#ebe3d6]',
        )}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-1 self-end text-[10px]',
            isOwn ? 'text-white/70' : 'text-[#9a8f80]',
          )}
        >
          <span>{time}</span>
          {isOwn ? (
            isRead ? (
              <span className="flex items-center gap-0.5" title="Dibaca">
                <CheckCheck className="size-3" aria-hidden />
                <span className="sr-only">Dibaca</span>
              </span>
            ) : (
              <Check className="size-3" aria-label="Terkirim" />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
