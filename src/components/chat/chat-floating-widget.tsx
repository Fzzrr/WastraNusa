'use client';

import { ChatConversationList } from '@/components/chat/chat-conversation-list';
import { ChatThread } from '@/components/chat/chat-thread';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useConversations } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { isSeller } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/types/chat';
import { Maximize2, MessageCircle, MessagesSquare, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Pages with their own chat UI, panels, or no signed-in user. */
const HIDDEN_PATH_PREFIXES = [
  '/chat',
  '/admin',
  '/seller',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/** Unread badge refresh while the panel is closed (only when tab visible). */
const UNREAD_POLL_MS = 30_000;

function isHiddenPath(pathname: string) {
  return HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Floating live-chat launcher shown on public pages for signed-in users:
 * a bubble with an unread badge that opens a compact chat panel.
 */
export function ChatFloatingWidget() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  if (!user || isHiddenPath(pathname)) return null;

  // Article pages already have the AI assistant bubble in this corner.
  const raised = /^\/encyclopedia\/[^/]+/.test(pathname);

  return (
    <FloatingChat
      currentUserId={user.id}
      variant={isSeller(user.role) ? 'seller' : 'buyer'}
      raised={raised}
    />
  );
}

function FloatingChat({
  currentUserId,
  variant,
  raised,
}: {
  currentUserId: string;
  variant: 'seller' | 'buyer';
  raised: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: conversations, isLoading } = useConversations({
    refetchInterval: isOpen ? false : UNREAD_POLL_MS,
  });

  const totalUnread = (conversations ?? []).reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (isOpen) {
    return (
      <ChatPanel
        conversations={conversations ?? []}
        isLoading={isLoading}
        currentUserId={currentUserId}
        variant={variant}
        totalUnread={totalUnread}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onClose={() => setIsOpen(false)}
      />
    );
  }

  return (
    <div
      className={cn(
        'fixed right-4 z-40 transition-[bottom] duration-300 sm:right-6',
        raised ? 'bottom-24' : 'bottom-4 sm:bottom-6',
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={
          totalUnread > 0
            ? `Buka pesan, ${totalUnread} belum dibaca`
            : 'Buka pesan'
        }
        aria-haspopup="dialog"
        className="group relative flex animate-in cursor-pointer items-center gap-2.5 rounded-full bg-[#2f5b49] p-2 text-white shadow-[0_10px_25px_-5px_rgba(47,91,73,0.5)] ring-2 ring-[#caa86a]/40 transition-all duration-300 fade-in slide-in-from-bottom-4 hover:-translate-y-1 hover:bg-[#254b3c] hover:shadow-[0_14px_30px_-5px_rgba(47,91,73,0.65)] hover:ring-[#caa86a] active:scale-95 sm:pr-4"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-[#f5ead3] transition-transform duration-300 group-hover:-rotate-12">
          <MessageCircle className="size-[18px] text-[#2f5b49]" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs leading-tight font-bold tracking-wide text-[#f5ead3]">
            Pesan
          </span>
          <span className="block text-[10px] font-medium text-white/80">
            {totalUnread > 0
              ? `${totalUnread} belum dibaca`
              : 'Chat dengan penjual'}
          </span>
        </span>

        {totalUnread > 0 ? (
          <span className="absolute -top-1.5 -right-1 flex">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#caa86a] opacity-60" />
            <span className="relative min-w-5 rounded-full bg-[#caa86a] px-1.5 text-center text-[10px] leading-5 font-bold text-[#274c3d] tabular-nums ring-2 ring-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          </span>
        ) : null}
      </button>
    </div>
  );
}

function ChatPanel({
  conversations,
  isLoading,
  currentUserId,
  variant,
  totalUnread,
  selectedId,
  onSelect,
  onClose,
}: {
  conversations: ConversationSummary[];
  isLoading: boolean;
  currentUserId: string;
  variant: 'seller' | 'buyer';
  totalUnread: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}) {
  // Live updates only while the panel is open, not on every page view.
  useChatStream();

  const fullPageHref = selectedId
    ? `/chat?c=${encodeURIComponent(selectedId)}`
    : '/chat';

  return (
    <aside
      role="dialog"
      aria-label="Pesan"
      className="fixed inset-x-3 top-20 bottom-3 z-50 flex animate-in flex-col overflow-hidden rounded-3xl border border-[#e4d9c7] bg-[#fffdf8] shadow-[0_20px_45px_-10px_rgba(47,91,73,0.35)] duration-200 fade-in slide-in-from-bottom-4 zoom-in-95 sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px]"
    >
      <header className="flex items-center justify-between gap-3 bg-[#274c3d] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#376352] ring-1 ring-[#caa86a]/60">
            <MessagesSquare className="size-5 text-[#f5ead3]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-[#fbf8f2]">
              Pesan WastraNusa
            </h2>
            <p className="truncate text-[11px] text-white/70">
              {totalUnread > 0
                ? `${totalUnread} pesan belum dibaca`
                : 'Ngobrol langsung dengan penjual'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/75">
          <Link
            href={fullPageHref}
            onClick={onClose}
            title="Buka halaman pesan"
            aria-label="Buka halaman pesan"
            className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
          >
            <Maximize2 className="size-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            title="Tutup"
            aria-label="Tutup pesan"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {selectedId ? (
          <ChatThread
            key={selectedId}
            conversationId={selectedId}
            currentUserId={currentUserId}
            variant={variant}
            compact
            onBack={() => onSelect(null)}
          />
        ) : (
          <ChatConversationList
            conversations={conversations}
            selectedId={selectedId}
            currentUserId={currentUserId}
            onSelect={onSelect}
            isLoading={isLoading}
          />
        )}
      </div>
    </aside>
  );
}
