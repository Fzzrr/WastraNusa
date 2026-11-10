'use client';

import { formatTime } from '@/components/chat/chat-format';
import { ChatProductCard } from '@/components/chat/chat-product-card';
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
          'group/bubble flex max-w-[82%] flex-col gap-1 rounded-xl px-3.5 py-2 text-[15px] leading-relaxed transition-shadow sm:max-w-[68%]',
          isOwn ? 'bg-brand text-on-field' : 'bg-card text-ink',
          isLastInGroup && (isOwn ? 'rounded-br-md' : 'rounded-bl-md'),
        )}
      >
        {message.product ? (
          <ChatProductCard product={message.product} className="-mx-1 mt-0.5" />
        ) : null}
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-1 self-end text-[13px] tabular-nums',
            isOwn ? 'text-white/75' : 'text-ink-soft',
          )}
        >
          <span>{time}</span>
          {isOwn ? (
            isRead ? (
              <span className="flex items-center text-gold" title="Dibaca">
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
