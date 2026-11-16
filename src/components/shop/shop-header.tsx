'use client';

import { StatCard } from '@/components/encyclopedia/encyclopedia-stats';
import { ImagePreview } from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { KawungPattern } from '@/components/wastra-hero';
import { useStartConversation } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import type { ProductInventoryItem } from '@/types/product';
import type { PublicShopProfile } from '@/types/shop';
import {
  ArrowUpRight,
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
  'group/cta w-full gap-1.5 sm:w-auto sm:self-start lg:w-full rounded-xl bg-gradient-to-r from-[#f3dfb4] to-[#d7ccb7] px-5 font-bold text-[#2c503f] shadow-[0_10px_24px_-12px_rgba(232,203,141,0.9)] transition hover:-translate-y-0.5 hover:from-[#f7e8c6] hover:to-[#e8cb8d] active:scale-95';

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
          'text-base leading-relaxed whitespace-pre-line text-[#c9d9ce]',
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
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#e8cb8d] transition hover:text-[#fff6e3]"
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

/** Contact detail tile; a link (call, email, map) when `href` is given. */
function InfoTile({
  icon: Icon,
  label,
  value,
  href,
  className,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5ead3] text-[#8a6a3a] transition-all duration-300 group-hover:scale-105 group-hover:-rotate-6 group-hover:bg-[#2f5f49] group-hover:text-[#e8cb8d]">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-[#9a8f80]">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-medium break-words text-[#3d4f45]">
          {value}
        </span>
      </span>
      {href ? (
        <ArrowUpRight className="absolute top-3 right-3 size-4 text-[#b08a5e] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      ) : null}
    </>
  );

  const tileClassName = cn(
    'group relative flex items-center gap-3 rounded-2xl bg-[#fbf8f2] p-3 ring-1 ring-[#ebe3d6] transition-all duration-300',
    className,
  );

  return href ? (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={cn(
        tileClassName,
        'hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-20px_rgba(47,91,73,0.6)] hover:ring-[#caa86a]/60',
      )}
    >
      {content}
    </a>
  ) : (
    <div className={tileClassName}>{content}</div>
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d3a2d] via-[#2a5541] to-[#3a6a52] px-5 pt-7 pb-5 text-[#f2f7ef] shadow-[0_30px_60px_-34px_rgba(15,41,28,0.9)] md:px-10 md:pt-10 md:pb-8">
        <KawungPattern className="inset-0 size-full text-[#e8cb8d] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]" />
        <span className="pointer-events-none absolute -top-28 right-1/4 size-80 rounded-full bg-[#e8cb8d]/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-[#7fb89a]/10 blur-3xl" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8cb8d]/50 to-transparent" />

        {/* lg: identity + description on the left, CTA + stats fill the right. */}
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="shrink-0 animate-in duration-500 fill-mode-both zoom-in-95 fade-in">
                {shop.logoURL ? (
                  <ImagePreview
                    url={shop.logoURL}
                    className="size-24 rounded-2xl bg-[#fffdfa] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.7)] ring-4 ring-[#f7f2e7]/90 sm:size-28"
                  />
                ) : (
                  <div className="grid size-24 place-items-center rounded-2xl bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.7)] ring-4 ring-[#f7f2e7]/90 sm:size-28">
                    <Store className="size-10" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex animate-in items-center gap-1.5 rounded-full border border-[#e8cb8d]/40 bg-black/20 px-3 py-1 text-xs font-semibold text-[#f3dfb4] backdrop-blur duration-500 fill-mode-both fade-in">
                  <Store className="size-3 text-[#e8cb8d]" />
                  Toko Pengrajin
                </span>
                <h1 className="mt-3 animate-in text-3xl font-bold tracking-tight break-words text-[#f7f2e7] duration-500 fill-mode-both fade-in slide-in-from-bottom-2 sm:text-4xl lg:text-5xl">
                  {shop.shopName}
                </h1>
                <div className="mt-3 h-1.5 w-20 origin-left animate-in rounded-full bg-gradient-to-r from-[#e8cb8d] to-[#caa86a] delay-200 duration-700 fill-mode-both zoom-in-0" />
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#c9d9ce]">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4 text-[#e8cb8d]" />
                    {shop.sellerName}
                  </span>
                  {location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-[#e8cb8d]" />
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

          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
            <HubungiPenjualButton sellerId={shop.sellerId} />
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {hasInfo ? (
        <section className="grid gap-3 rounded-2xl bg-[#fffdfa] p-3 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6] sm:grid-cols-2 lg:grid-cols-4">
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
          {location ? (
            <InfoTile icon={MapPin} label="Lokasi" value={location} />
          ) : null}
          {joinedAt ? (
            <InfoTile icon={CalendarDays} label="Bergabung" value={joinedAt} />
          ) : null}
          {shop.address ? (
            <InfoTile
              icon={MapPin}
              label="Alamat · buka di peta"
              value={shop.address}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
              className="sm:col-span-2 lg:col-span-4"
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
