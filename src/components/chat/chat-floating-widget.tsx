'use client';

import { ChatConversationList } from '@/components/chat/chat-conversation-list';
import { ChatThread } from '@/components/chat/chat-thread';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useConversations } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { isSeller } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';
import type { ChatAttachedProduct, ConversationSummary } from '@/types/chat';
import { Maximize2, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';

/** Unread badge refresh while the panel is closed (only when tab visible). */
const UNREAD_POLL_MS = 30_000;

const OPEN_EVENT = 'wastra:open-seller-chat';

type OpenSellerChatDetail = {
  conversationId: string;
  product?: ChatAttachedProduct;
};

/** Open the floating panel on a conversation, optionally with a product attached. */
export function openSellerChat(detail: OpenSellerChatDetail) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail }));
}

/**
 * Floating seller live-chat launcher, shown on catalog pages for signed-in
 * users: a bubble with an unread badge that opens a compact chat panel.
 */
const subscribeNoop = () => () => {};

export function ChatFloatingWidget() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  // The server render never has the session, so render only once hydrated;
  // otherwise server and client markup differ.
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  if (!isClient || !user || !/^\/catalog(\/|$)/.test(pathname)) return null;

  // Product pages pin the buy buttons to the bottom on phones.
  const raisedOnMobile = /^\/catalog\/[^/]+/.test(pathname);

  return (
    <FloatingChat
      currentUserId={user.id}
      variant={isSeller(user.role) ? 'seller' : 'buyer'}
      raisedOnMobile={raisedOnMobile}
    />
  );
}

function FloatingChat({
  currentUserId,
  variant,
  raisedOnMobile,
}: {
  currentUserId: string;
  variant: 'seller' | 'buyer';
  raisedOnMobile: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attachedProduct, setAttachedProduct] =
    useState<ChatAttachedProduct | null>(null);
  const { data: conversations, isLoading } = useConversations({
    refetchInterval: isOpen ? false : UNREAD_POLL_MS,
  });

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const { conversationId, product } = (
        event as CustomEvent<OpenSellerChatDetail>
      ).detail;
      setSelectedId(conversationId);
      setAttachedProduct(product ?? null);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

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
        onSelect={(id) => {
          setSelectedId(id);
          setAttachedProduct(null);
        }}
        attachedProduct={attachedProduct}
        onClearAttachment={() => setAttachedProduct(null)}
        onClose={() => setIsOpen(false)}
      />
    );
  }

  return (
    <div
      className={cn(
        'fixed right-4 z-40 sm:right-6 sm:bottom-6',
        raisedOnMobile ? 'bottom-24' : 'bottom-4',
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
        title="Pesan"
        aria-haspopup="dialog"
        className="relative grid size-14 animate-in cursor-pointer place-items-center rounded-full bg-brand text-on-field transition fade-in slide-in-from-bottom-4 hover:bg-brand-strong active:scale-95"
      >
        <MessageCircle className="size-6" strokeWidth={1.75} />

        {totalUnread > 0 ? (
          <span className="absolute -top-1 -right-1 flex">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60 motion-reduce:animate-none" />
            <span className="relative min-w-[22px] rounded-full bg-gold px-1.5 text-center text-[13px] leading-[22px] font-bold text-ink tabular-nums ring-2 ring-ground">
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
  attachedProduct,
  onClearAttachment,
  onClose,
}: {
  conversations: ConversationSummary[];
  isLoading: boolean;
  currentUserId: string;
  variant: 'seller' | 'buyer';
  totalUnread: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  attachedProduct: ChatAttachedProduct | null;
  onClearAttachment: () => void;
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
      className="fixed inset-x-3 top-20 bottom-3 z-50 flex animate-in flex-col overflow-hidden rounded-2xl bg-card shadow-[0_24px_48px_-16px_rgba(31,53,43,0.4)] duration-200 fade-in slide-in-from-bottom-4 zoom-in-95 sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px]"
    >
      <header className="flex items-center justify-between gap-3 bg-field px-4 py-3 text-on-field">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-on-field">Pesan</h2>
            {totalUnread > 0 ? (
              <p className="truncate text-[13px] text-on-field-soft">
                {totalUnread} belum dibaca
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center text-on-field-soft">
          <Link
            href={fullPageHref}
            onClick={onClose}
            title="Buka halaman pesan"
            aria-label="Buka halaman pesan"
            className="grid size-10 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
          >
            <Maximize2 className="size-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            title="Tutup"
            aria-label="Tutup pesan"
            className="grid size-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
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
            attachedProduct={attachedProduct}
            onClearAttachment={onClearAttachment}
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
