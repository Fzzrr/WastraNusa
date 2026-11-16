'use client';

import { StatCard } from '@/components/encyclopedia/encyclopedia-stats';
import { ImagePreview } from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { useStartConversation } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import type { PublicShopProfile } from '@/types/shop';
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

function formatJoinedAt(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const ctaClassName =
  'group/cta h-12 w-full gap-1.5 rounded-full bg-ground px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-white active:scale-95 sm:w-auto sm:self-start lg:w-full';

function HubungiPenjualButton({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const startConversation = useStartConversation();
  const { data: session } = authClient.useSession();

  const viewerId = session?.user?.id;
  // Hidden for guests; the owner gets a way back to their seller panel.
  if (!viewerId) {
    return null;
  }
  if (viewerId === sellerId) {
    return (
      <Button asChild size="lg" className={ctaClassName}>
        <Link href="/seller/dashboard">
          <LayoutDashboard className="size-4 transition-transform group-hover/cta:-rotate-12" />
          Kelola Toko
        </Link>
      </Button>
    );
  }

  const handleContact = async () => {
    try {
      const convo = await startConversation.mutateAsync(sellerId);
      router.push(`/chat?c=${convo.id}`);
    } catch {
      toast.error('Gagal memulai percakapan. Silakan coba lagi.');
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleContact}
      disabled={startConversation.isPending}
      className={ctaClassName}
    >
      <MessageCircle className="size-4 transition-transform group-hover/cta:-rotate-12" />
      Hubungi Penjual
    </Button>
  );
}

/** Shop description clamped to 3 lines; the toggle only shows when it overflows. */
function ShopDescription({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || expanded) return;
    // Fires once on observe and again on resize, so no sync setState here.
    const observer = new ResizeObserver(() =>
      setOverflows(element.scrollHeight > element.clientHeight + 1),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className="mt-5 animate-in delay-100 duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
      <p
        ref={ref}
        className={cn(
          'text-base leading-relaxed whitespace-pre-line text-on-field-soft',
          !expanded && 'line-clamp-3',
        )}
      >
        {text}
      </p>
      {overflows || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-2 inline-flex items-center gap-1 text-[15px] font-semibold text-gold transition hover:text-on-field"
        >
          {expanded ? 'Sembunyikan' : 'Baca selengkapnya'}
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-300',
              expanded && 'rotate-180',
            )}
          />
        </button>
      ) : null}
    </div>
  );
}

/** Contact detail: the icon names it, the value is the content. */
function InfoTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon
        className="mt-0.5 size-5 shrink-0 text-ink-soft"
        strokeWidth={1.75}
      />
      <span className="sr-only">{label}: </span>
      <span className="min-w-0 text-base break-words text-ink">{value}</span>
    </>
  );
  const className = 'flex items-start gap-3';

  return href ? (
    <a
      href={href}
      title={label}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={cn(className, 'underline-offset-4 hover:underline')}
    >
      {content}
    </a>
  ) : (
    <div title={label} className={className}>
      {content}
    </div>
  );
}

export function ShopHeader({
  shop,
  products,
}: {
  shop: PublicShopProfile;
  products: ProductInventoryItem[];
}) {
  const location = [shop.city, shop.province].filter(Boolean).join(', ');
  const joinedAt = formatJoinedAt(shop.joinedAt);
  const hasInfo = Boolean(
    shop.phoneNumber || shop.email || location || joinedAt || shop.address,
  );
  const stats = [
    { value: String(products.length), label: 'Produk' },
    {
      value: String(products.reduce((sum, p) => sum + p.sold, 0)),
      label: 'Terjual',
    },
    {
      value: String(new Set(products.map((p) => p.clothingType)).size),
      label: 'Jenis Wastra',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="relative overflow-hidden bg-field px-5 pt-8 pb-6 text-on-field md:px-12 md:pt-12 md:pb-10">
        {/* lg: identity + description on the left, CTA + stats fill the right. */}
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="shrink-0 animate-in duration-500 fill-mode-both zoom-in-95 fade-in">
                {shop.logoURL ? (
                  <ImagePreview
                    url={shop.logoURL}
                    className="size-24 bg-card sm:size-28"
                  />
                ) : (
                  <div className="grid size-24 place-items-center bg-white/10 text-on-field-soft sm:size-28">
                    <Store className="size-10" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="animate-in text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] break-words text-on-field duration-500 fill-mode-both fade-in slide-in-from-bottom-2">
                  {shop.shopName}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-on-field-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4" strokeWidth={1.75} />
                    {shop.sellerName}
                  </span>
                  {location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" strokeWidth={1.75} />
                      {location}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            {shop.description ? (
              <ShopDescription text={shop.description} />
            ) : null}
          </div>

          <div className="flex flex-col gap-8">
            <HubungiPenjualButton sellerId={shop.sellerId} />
            <div className="flex flex-wrap gap-x-10 gap-y-6">
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {hasInfo ? (
        <section className="grid gap-x-10 gap-y-4 px-1 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {shop.phoneNumber ? (
            <InfoTile
              icon={Phone}
              label="Telepon"
              value={shop.phoneNumber}
              href={`tel:${shop.phoneNumber}`}
            />
          ) : null}
          {shop.email ? (
            <InfoTile
              icon={Mail}
              label="Email"
              value={shop.email}
              href={`mailto:${shop.email}`}
            />
          ) : null}
          {joinedAt ? (
            <InfoTile icon={CalendarDays} label="Bergabung" value={joinedAt} />
          ) : null}
          {shop.address ? (
            <InfoTile
              icon={MapPin}
              label="Alamat, buka di peta"
              value={shop.address}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
