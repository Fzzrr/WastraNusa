'use client';

import { formatTime } from '@/components/chat/chat-format';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';

export function ChatMessageBubble({
  message,
  isOwn,
  isFirstInGroup = true,
  isLastInGroup = true,
}: {
  message: ConversationMessage;
  isOwn: boolean;
  /** First of consecutive messages from the same sender (adds top spacing). */
  isFirstInGroup?: boolean;
  /** Last of consecutive messages from the same sender (gets the tail). */
  isLastInGroup?: boolean;
}) {
  const time = formatTime(message.createdAt);
  const isRead = Boolean(message.readAt);

  return (
    <div
      className={cn(
        'flex w-full animate-in duration-300 fade-in slide-in-from-bottom-1',
        isOwn ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-3' : 'mt-1',
      )}
    >
      <div
        className={cn(
          'group/bubble flex max-w-[82%] flex-col gap-1 rounded-2xl px-3.5 py-2 text-sm leading-relaxed transition-shadow sm:max-w-[68%]',
          isOwn
            ? 'bg-gradient-to-br from-[#2f5f49] to-[#3f7359] text-white shadow-[0_6px_16px_-10px_rgba(47,95,73,0.9)]'
            : 'bg-white text-[#2f3a33] shadow-[0_1px_2px_rgba(60,41,15,0.06)] ring-1 ring-[#ebe3d6]',
          isLastInGroup && (isOwn ? 'rounded-br-md' : 'rounded-bl-md'),
        )}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-1 self-end text-[10px] tabular-nums',
            isOwn ? 'text-white/75' : 'text-[#a39784]',
          )}
        >
          <span>{time}</span>
          {isOwn ? (
            isRead ? (
              <span className="flex items-center text-[#e8cb8d]" title="Dibaca">
                <CheckCheck className="size-3.5" aria-hidden />
                <span className="sr-only">Dibaca</span>
              </span>
            ) : (
              <span className="flex items-center" title="Terkirim">
                <Check className="size-3.5" aria-hidden />
                <span className="sr-only">Terkirim</span>
              </span>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
