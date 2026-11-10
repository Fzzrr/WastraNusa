'use client';

import { Button } from '@/components/ui/button';
import { useArticleChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import {
  CornerDownLeft,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ChatProductRecommendations } from './chat-product-recommendations';

interface EncyclopediaChatWidgetProps {
  articleId: string;
  articleTitle: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SUGGESTED_QUESTIONS = [
  'Rangkum poin utama artikel ini',
  'Apa makna motif kain ini?',
  'Dari mana asal-usulnya?',
  'Apa bahan dan teknik pembuatannya?',
  'Ada produk terkait yang bisa dibeli?',
];

/**
 * Lightweight markdown renderer for AI responses.
 * Handles: **bold**, numbered lists (1. ...), bullet lists (- ...), and newlines.
 * No external dependencies needed.
 */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Numbered list: "1. text" or "1) text"
        const numberedMatch = trimmed.match(/^(\d+)[.)\s]\s*(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="shrink-0 font-semibold text-ink">
                {numberedMatch[1]}.
              </span>
              <span>{parseBold(numberedMatch[2])}</span>
            </div>
          );
        }

        // Bullet list: "- text" or "* text"
        const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
              <span>{parseBold(bulletMatch[1])}</span>
            </div>
          );
        }

        // Normal paragraph
        return <p key={i}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
}

/** Converts **bold** segments inside a string to <strong> elements. */
function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function EncyclopediaChatWidget({
  articleId,
  articleTitle,
  isOpen: controlledIsOpen,
  onOpenChange,
}: EncyclopediaChatWidgetProps) {
  const chat = useArticleChat(articleId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync controlled state if provided
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : chat.isOpen;
  const setIsOpen = (open: boolean) => {
    chat.setIsOpen(open);
    onOpenChange?.(open);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !chat.isMinimized) {
      messagesEndRef.current?.scrollIntoView({
        behavior: chat.isStreaming ? 'auto' : 'smooth',
      });
    }
  }, [
    chat.messages,
    chat.isPending,
    chat.isStreaming,
    isOpen,
    chat.isMinimized,
  ]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !chat.isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, chat.isMinimized]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || chat.isPending) return;

    chat.sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedClick = (question: string) => {
    // Strip leading emoji
    const cleanText = question.replace(/^[^\w\s]+/, '').trim();
    chat.sendMessage(cleanText);
  };

  // Floating trigger button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Tanya asisten"
          aria-label="Tanya asisten AI seputar artikel ini"
          className="grid size-14 cursor-pointer place-items-center rounded-full bg-brand text-on-field shadow-[0_12px_28px_-10px_rgba(31,53,43,0.55)] transition hover:bg-brand-strong active:scale-95"
        >
          <Sparkles className="size-6" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  // Minimized floating pill state
  if (chat.isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-2 rounded-full bg-card py-1.5 pr-1.5 pl-4 shadow-[0_12px_28px_-10px_rgba(31,53,43,0.45)]">
          <Sparkles className="size-4 text-brand" strokeWidth={1.75} />
          <span className="text-[13px] font-semibold text-ink">
            Asisten Wastra
          </span>
          <button
            type="button"
            onClick={() => chat.setIsMinimized(false)}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            title="Buka kembali"
          >
            <Maximize2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            title="Tutup"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded interactive chat window
  return (
    <aside
      aria-label="Chatbot Q&A Artikel WastraNusa"
      className="fixed bottom-4 right-4 z-50 flex h-[580px] max-h-[88vh] w-[94vw] flex-col overflow-hidden rounded-2xl bg-card shadow-[0_24px_48px_-16px_rgba(31,53,43,0.4)] sm:right-6 sm:bottom-6 sm:w-[410px]"
    >
      {/* Header */}
      <header className="relative flex items-center justify-between bg-field py-2 pr-2 pl-5 text-on-field">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Tanya asisten</h2>
          <p
            className="truncate text-[13px] text-on-field-soft"
            title={articleTitle}
          >
            {articleTitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center text-on-field-soft">
          {chat.messages.length > 0 && (
            <button
              type="button"
              onClick={chat.clearChat}
              className="grid size-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
              title="Mulai percakapan baru"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => chat.setIsMinimized(true)}
            className="grid size-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
            title="Kecilkan jendela"
          >
            <Minimize2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid size-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
            title="Tutup jendela chat"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {/* Messages Body */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-ground p-4 text-[15px] leading-relaxed text-ink">
        {/* Welcome message if no chat yet */}
        {chat.messages.length === 0 && (
          <div className="space-y-4 pt-2">
            <p className="text-ink-soft">
              Tanya apa saja tentang artikel ini: sejarah, motif, makna, atau
              produknya.
            </p>

            {/* Suggested prompts */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSuggestedClick(question)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-3 text-left text-[15px] text-ink transition-colors hover:bg-brand hover:text-on-field active:scale-[0.99]"
                  >
                    <span>{question}</span>
                    <CornerDownLeft className="size-3 text-ink-soft" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation history bubbles */}
        {chat.messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-2.5 transition-opacity duration-300',
                isUser ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[88%] rounded-2xl px-4 py-3',
                  isUser
                    ? 'rounded-br-sm bg-brand text-on-field'
                    : 'rounded-bl-sm bg-card text-ink',
                )}
              >
                <div className="text-[15px] leading-relaxed">
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{message.text}</span>
                  ) : (
                    renderMarkdown(message.text)
                  )}
                </div>

                {!isUser && message.products?.length ? (
                  <ChatProductRecommendations products={message.products} />
                ) : null}

                {/* Footer status (timestamp & cache badge) */}
                <div
                  className={cn(
                    'mt-2 flex items-center gap-1.5 text-[13px]',
                    isUser
                      ? 'justify-end text-white/70'
                      : 'justify-start text-ink-soft',
                  )}
                >
                  {message.cached && (
                    <span className="flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.2 text-ink">
                      <Zap className="size-2.5" />
                      Instan
                    </span>
                  )}
                  <span>
                    {message.timestamp.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading typing indicator */}
        {chat.isPending && !chat.isStreaming && (
          <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-[15px] text-ink-soft">
            <Loader2 className="size-4 animate-spin" />
            Membaca artikel…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Area */}
      <footer className="bg-card p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya tentang artikel ini"
              aria-label="Pertanyaan untuk asisten"
              disabled={chat.isPending}
              maxLength={1000}
              className="h-12 w-full rounded-full bg-surface pr-10 pl-5 text-base text-ink placeholder:text-ink-soft focus:outline-2 focus:outline-brand/30 disabled:opacity-60"
            />
            {inputText.length > 800 && (
              <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[13px] font-medium text-amber-700">
                {1000 - inputText.length}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={!inputText.trim() || chat.isPending}
            aria-label="Kirim"
            className="size-12 shrink-0 rounded-full bg-brand text-on-field transition-colors hover:bg-brand-strong active:scale-95 disabled:opacity-40"
          >
            {chat.isPending ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </form>

        <p className="mt-1.5 text-center text-[13px] text-ink-soft">
          AI menggunakan artikel, katalog terkini, dan pengetahuan umum yang
          relevan. Periksa detail produk sebelum membeli.
        </p>
      </footer>
    </aside>
  );
}
