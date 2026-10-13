'use client';

import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/use-conversations';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

export function ChatComposer({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutateAsync, isPending } = useSendMessage(conversationId);

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
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const canSend = content.trim().length > 0 && !isPending;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
      className="flex items-end gap-2 border-t border-[#efe8dd] bg-[#fffdfa] px-3 py-3 sm:px-4"
    >
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
        placeholder="Tulis pesan..."
        disabled={isPending}
        className="max-h-32 min-h-[2.75rem] w-full resize-none rounded-xl border border-[#e5ded5] bg-white px-4 py-3 text-sm text-[#2f3a33] placeholder:text-[#b3aa9e] transition-shadow focus:outline-none focus-visible:border-[#3a5a4a] focus-visible:ring-3 focus-visible:ring-[#3a5a4a]/15 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <Button
        type="submit"
        size="icon-lg"
        disabled={!canSend}
        aria-label="Kirim pesan"
        className={cn(
          'size-11 shrink-0 cursor-pointer rounded-xl bg-[#2f5f49] text-white hover:bg-[#2f4f3f] disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {isPending ? (
          <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </form>
  );
}
