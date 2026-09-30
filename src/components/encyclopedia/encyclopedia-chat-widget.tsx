'use client';

import { Button } from '@/components/ui/button';
import { useArticleChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import {
  Bot,
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

interface EncyclopediaChatWidgetProps {
  articleId: string;
  articleTitle: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SUGGESTED_QUESTIONS = [
  '💡 Rangkum poin utama artikel ini',
  '🧵 Apa filosofi dan makna motif kain ini?',
  '🏛️ Dari mana asal-usul dan sejarahnya?',
  '✨ Apa bahan dan teknik pembuatannya?',
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
              <span className="shrink-0 font-semibold text-[#2f5b49]">
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
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#2f5b49]" />
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
        <strong key={i} className="font-semibold text-[#1e3d2d]">
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, chat.isPending, isOpen, chat.isMinimized]);

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
          className="group relative flex items-center gap-2.5 rounded-full bg-[#2f5b49] px-4 py-3 text-white shadow-[0_10px_25px_-5px_rgba(47,91,73,0.5)] ring-2 ring-[#caa86a]/40 transition-all duration-300 hover:-translate-y-1 hover:bg-[#254b3c] hover:shadow-[0_14px_30px_-5px_rgba(47,91,73,0.65)] hover:ring-[#caa86a] active:scale-95"
          aria-label="Tanya Asisten AI seputar artikel ini"
        >
          <span className="relative flex size-8 items-center justify-center rounded-full bg-[#f5ead3] text-[#2f5b49] transition-transform duration-300 group-hover:rotate-12">
            <Sparkles className="size-4 text-[#a07a2c]" />
          </span>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight tracking-wide text-[#f5ead3]">
              Tanya Asisten
            </p>
            <p className="text-[10px] font-medium text-white/80">
              Q&A Artikel Ini
            </p>
          </div>
          {/* Subtle pulsating status dot */}
          <span className="absolute -top-1 -right-1 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#caa86a] opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-[#caa86a]" />
          </span>
        </button>
      </div>
    );
  }

  // Minimized floating pill state
  if (chat.isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-2 rounded-full border border-[#d8cdba] bg-[#fbf8f2] py-2 pr-3 pl-4 shadow-xl">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#2f5b49] text-white">
            <Bot className="size-3.5" />
          </span>
          <span className="text-xs font-semibold text-[#2f5b49]">
            Asisten Wastra
          </span>
          <button
            type="button"
            onClick={() => chat.setIsMinimized(false)}
            className="flex size-7 items-center justify-center rounded-full text-[#7d7465] transition-colors hover:bg-[#eae1d0] hover:text-[#2f5b49]"
            title="Buka kembali"
          >
            <Maximize2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex size-7 items-center justify-center rounded-full text-[#7d7465] transition-colors hover:bg-[#eae1d0] hover:text-red-600"
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
      className="fixed bottom-4 right-4 z-50 flex h-[580px] max-h-[88vh] w-[94vw] flex-col overflow-hidden rounded-3xl border border-[#e4d9c7] bg-[#fbf8f2] shadow-[0_20px_45px_-10px_rgba(47,91,73,0.35)] sm:right-6 sm:bottom-6 sm:w-[410px]"
    >
      {/* Header */}
      <header className="relative flex items-center justify-between border-b border-[#e2d7c4] bg-[#274c3d] px-4 py-3.5 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#376352] ring-1 ring-[#caa86a]/60">
            <Bot className="size-5 text-[#f5ead3]" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#274c3d] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold tracking-tight text-[#fbf8f2]">
                Asisten WastraNusa
              </h2>
              <span className="rounded-full bg-[#caa86a]/25 px-1.5 py-0.2 text-[9px] font-semibold text-[#f5ead3]">
                AI
              </span>
            </div>
            <p
              className="truncate text-[11px] text-white/70"
              title={articleTitle}
            >
              Seputar: {articleTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-white/75">
          {chat.messages.length > 0 && (
            <button
              type="button"
              onClick={chat.clearChat}
              className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
              title="Mulai percakapan baru"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => chat.setIsMinimized(true)}
            className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
            title="Kecilkan jendela"
          >
            <Minimize2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
            title="Tutup jendela chat"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {/* Messages Body */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#faf6ee] p-4 text-xs leading-relaxed text-[#2c2823]">
        {/* Welcome message if no chat yet */}
        {chat.messages.length === 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2f5b49] text-white">
                <Sparkles className="size-3.5 text-[#caa86a]" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[#e8ddcb] bg-white p-3.5 shadow-sm">
                <p className="font-medium text-[#2f5b49]">
                  Halo! Saya asisten khusus untuk artikel ini.
                </p>
                <p className="mt-1 text-[#665e52]">
                  Silakan tanyakan apa pun seputar sejarah, filosofi motif,
                  makna budaya, atau teknik pembuatannya. Jawaban saya
                  sepenuhnya dirangkum dari isi artikel.
                </p>
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="space-y-2 pt-2">
              <p className="px-1 text-[11px] font-semibold text-[#8a7f70]">
                Pertanyaan yang sering diajukan:
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSuggestedClick(question)}
                    className="flex items-center justify-between rounded-xl border border-[#e5dcce] bg-[#fdfbf7] p-2.5 text-left text-[11px] font-medium text-[#463f35] transition-all hover:border-[#caa86a] hover:bg-[#fffdfa] hover:text-[#2f5b49] hover:shadow-xs active:scale-[0.99]"
                  >
                    <span>{question}</span>
                    <CornerDownLeft className="size-3 text-[#b3a896]" />
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
              {!isUser && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2f5b49] text-white">
                  <Bot className="size-3.5" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[84%] rounded-2xl p-3.5 shadow-sm',
                  isUser
                    ? 'rounded-tr-xs bg-[#2f5b49] text-white shadow-[#2f5b49]/10'
                    : 'rounded-tl-xs border border-[#e8ddcb] bg-white text-[#332f28]',
                )}
              >
                <div className="text-[12px] leading-relaxed">
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{message.text}</span>
                  ) : (
                    renderMarkdown(message.text)
                  )}
                </div>

                {/* Footer status (timestamp & cache badge) */}
                <div
                  className={cn(
                    'mt-2 flex items-center gap-1.5 text-[9px]',
                    isUser
                      ? 'justify-end text-white/70'
                      : 'justify-start text-[#948979]',
                  )}
                >
                  {message.cached && (
                    <span className="flex items-center gap-0.5 rounded-full bg-[#f3ebd9] px-1.5 py-0.2 text-[#8b6528]">
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
        {chat.isPending && (
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2f5b49] text-white">
              <Bot className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-[#e8ddcb] bg-white px-4 py-3 shadow-sm">
              <span className="size-1.5 animate-bounce rounded-full bg-[#2f5b49] [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-[#caa86a] [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-[#2f5b49]" />
              <span className="ml-2 text-[11px] text-[#7a7164]">
                Sedang membaca artikel...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Area */}
      <footer className="border-t border-[#e6dbc8] bg-[#fbf8f2] p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sesuatu tentang artikel ini..."
              disabled={chat.isPending}
              maxLength={1000}
              className="w-full rounded-2xl border border-[#d6cbba] bg-white py-2.5 pr-8 pl-3.5 text-xs text-[#2c2823] placeholder:text-[#998f80] focus:border-[#2f5b49] focus:outline-none focus:ring-2 focus:ring-[#2f5b49]/20 disabled:opacity-60"
            />
            {inputText.length > 800 && (
              <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[9px] font-medium text-amber-700">
                {1000 - inputText.length}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={!inputText.trim() || chat.isPending}
            className="size-9 shrink-0 rounded-2xl bg-[#2f5b49] text-white shadow-sm transition-all hover:bg-[#254b3c] active:scale-95 disabled:opacity-40"
          >
            {chat.isPending ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </form>

        <p className="mt-1.5 text-center text-[9px] text-[#9c9181]">
          Jawaban dijawab oleh AI dan bersumber secara eksklusif dari isi
          artikel ini.
        </p>
      </footer>
    </aside>
  );
}
