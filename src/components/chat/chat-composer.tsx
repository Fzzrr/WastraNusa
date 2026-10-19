'use client';

import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/use-conversations';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { type KeyboardEvent, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/** Mirrors the 2000-character limit in `sendMessageSchema`. */
const MAX_LENGTH = 2000;
const MAX_TEXTAREA_HEIGHT = 128;

export function ChatComposer({
  conversationId,
  suggestions,
  showHint = true,
}: {
  conversationId: string;
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
      await mutateAsync(trimmed);
      setContent('');
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
    <div className="border-t border-[#efe8dd] bg-[#fffdf8] px-3 pt-3 pb-3 sm:px-4">
      {showSuggestions ? (
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {suggestions!.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => pickSuggestion(text)}
              className="shrink-0 cursor-pointer rounded-full border border-[#e3d9c7] bg-white px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#4d6356] transition-colors hover:border-[#2f5f49]/40 hover:bg-[#e3ece5] hover:text-[#2f5f49]"
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
            className="block min-h-11 w-full resize-none rounded-2xl border border-[#e5ded5] bg-white px-4 py-3 text-sm leading-5 text-[#2f3a33] transition-[border-color,box-shadow] placeholder:text-[#b3aa9e] focus:outline-none focus-visible:border-[#3a5a4a] focus-visible:ring-3 focus-visible:ring-[#3a5a4a]/15"
          />
          {showCounter ? (
            <span
              className={cn(
                'pointer-events-none absolute right-3 bottom-1 text-[10px] tabular-nums',
                content.length >= MAX_LENGTH
                  ? 'text-[#b04a3a]'
                  : 'text-[#a39784]',
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
          className="size-11 shrink-0 cursor-pointer rounded-2xl bg-gradient-to-br from-[#2f5f49] to-[#3f7359] text-white shadow-[0_8px_18px_-10px_rgba(47,95,73,0.8)] transition-all hover:-translate-y-px hover:from-[#274e3c] hover:to-[#35644d] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          {isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>

      {showHint ? (
        <p className="mt-1.5 hidden px-1 text-[10px] text-[#b3aa9e] sm:block">
          <kbd className="font-sans font-semibold">Enter</kbd> untuk kirim ·{' '}
          <kbd className="font-sans font-semibold">Shift + Enter</kbd> untuk
          baris baru
        </p>
      ) : null}
    </div>
  );
}
