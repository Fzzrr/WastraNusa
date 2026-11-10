'use client';

import { ChatProductCard } from '@/components/chat/chat-product-card';
import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/use-conversations';
import { cn } from '@/lib/utils';
import type { ChatAttachedProduct } from '@/types/chat';
import { Send, X } from 'lucide-react';
import { type KeyboardEvent, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/** Mirrors the 2000-character limit in `sendMessageSchema`. */
const MAX_LENGTH = 2000;
const MAX_TEXTAREA_HEIGHT = 128;

export function ChatComposer({
  conversationId,
  suggestions,
  showHint = true,
  attachedProduct,
  onClearAttachment,
}: {
  conversationId: string;
  /** Product sent along with the next message, shown above the input. */
  attachedProduct?: ChatAttachedProduct | null;
  onClearAttachment?: () => void;
  /** Quick-reply chips shown while the input is empty. */
  suggestions?: string[];
  /** Keyboard shortcut hint under the input (hidden in tight layouts). */
  showHint?: boolean;
}) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutateAsync, isPending } = useSendMessage(conversationId);

  // Grow the textarea with its content, up to MAX_TEXTAREA_HEIGHT.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [content]);

  const send = async () => {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    try {
      await mutateAsync({
        content: trimmed,
        productId: attachedProduct?.id,
        variantId: attachedProduct?.variantId ?? undefined,
      });
      setContent('');
      onClearAttachment?.();
      textareaRef.current?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim pesan');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void send();
    }
  };

  const pickSuggestion = (text: string) => {
    setContent(text);
    textareaRef.current?.focus();
  };

  const canSend = content.trim().length > 0 && !isPending;
  const showCounter = content.length > MAX_LENGTH * 0.9;
  const showSuggestions = !!suggestions?.length && content.length === 0;

  return (
    <div className="border-t border-border bg-card px-3 pt-3 pb-3 sm:px-4">
      {attachedProduct ? (
        <div className="mb-2.5 flex items-center gap-2">
          <ChatProductCard product={attachedProduct} className="flex-1" />
          <button
            type="button"
            onClick={onClearAttachment}
            aria-label="Hapus produk yang disisipkan"
            title="Hapus produk"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {showSuggestions ? (
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {suggestions!.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => pickSuggestion(text)}
              className="shrink-0 cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-ink transition-colors hover:border-brand/40 hover:bg-surface hover:text-ink"
            >
              {text}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="flex items-end gap-2"
      >
        <div className="relative flex-1">
          <label htmlFor="chat-composer-input" className="sr-only">
            Tulis pesan
          </label>
          <textarea
            id="chat-composer-input"
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder="Tulis pesan..."
            className="block min-h-11 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[15px] leading-5 text-ink transition-[border-color,box-shadow] placeholder:text-ink-soft focus:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15"
          />
          {showCounter ? (
            <span
              className={cn(
                'pointer-events-none absolute right-3 bottom-1 text-[13px] tabular-nums',
                content.length >= MAX_LENGTH
                  ? 'text-destructive'
                  : 'text-ink-soft',
              )}
            >
              {content.length}/{MAX_LENGTH}
            </span>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={!canSend}
          aria-label="Kirim pesan"
          className="size-11 shrink-0 cursor-pointer rounded-full bg-brand text-on-field transition-colors hover:bg-brand-strong active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          {isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>

      {showHint ? (
        <p className="mt-1.5 hidden px-1 text-[13px] text-ink-soft sm:block">
          <kbd className="font-sans font-semibold">Enter</kbd> untuk kirim ·{' '}
          <kbd className="font-sans font-semibold">Shift + Enter</kbd> untuk
          baris baru
        </p>
      ) : null}
    </div>
  );
}
