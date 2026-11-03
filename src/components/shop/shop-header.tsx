'use client';

import { ImagePreview } from '@/components/form-sections';
import { Button } from '@/components/ui/button';
import { useStartConversation } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import type { PublicShopProfile } from '@/types/shop';
import {
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const surfaceCardClassName =
  'rounded-2xl border-0 bg-[#fffdfa] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_32px_rgba(89,69,38,0.06)] ring-1 ring-[#ebe3d6]';

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

function DetailItem({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[#5f7467]">
      <Icon className="size-4 shrink-0 text-[#8a6a3a]" />
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}

function HubungiPenjualButton({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const startConversation = useStartConversation();
  const { data: session } = authClient.useSession();

  const viewerId = session?.user?.id;
  // Hide for guests and for the seller viewing their own shop.
  if (!viewerId || viewerId === sellerId) {
    return null;
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
      className="gap-1.5 bg-[#2f5f49] text-white hover:bg-[#27503e]"
    >
      <MessageCircle className="size-4" />
      Hubungi Penjual
    </Button>
  );
}

export function ShopHeader({ shop }: { shop: PublicShopProfile }) {
  const location = [shop.city, shop.province].filter(Boolean).join(', ');
  const joinedAt = formatJoinedAt(shop.joinedAt);

  return (
    <section className={cn(surfaceCardClassName, 'overflow-hidden')}>
      {/* Decorative green banner */}
      <div className="h-20 bg-gradient-to-r from-[#2f5f49] to-[#3f7359] sm:h-24" />

      <div className="px-5 pb-6 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Logo / avatar */}
          <div className="-mt-12 shrink-0 sm:-mt-14">
            {shop.logoURL ? (
              <ImagePreview
                url={shop.logoURL}
                className="size-24 rounded-2xl border-4 border-[#fffdfa] bg-[#fffdfa] shadow-md sm:size-28"
              />
            ) : (
              <div className="grid size-24 place-items-center rounded-2xl border-4 border-[#fffdfa] bg-gradient-to-br from-[#3a5a4a] to-[#2f4b3d] text-[#e8cb8d] shadow-md sm:size-28">
                <Store className="size-10" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h1 className="text-2xl font-bold break-words text-[#2f4f3f] md:text-3xl">
              {shop.shopName}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#9a8f80]">
              <User className="size-4 text-[#8a6a3a]" />
              {shop.sellerName}
            </p>
          </div>

          <div className="shrink-0 sm:pb-1">
            <HubungiPenjualButton sellerId={shop.sellerId} />
          </div>
        </div>

        {shop.description ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed whitespace-pre-line text-[#4d6356]">
            {shop.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 border-t border-[#efe8dd] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
          {location ? <DetailItem icon={MapPin}>{location}</DetailItem> : null}
          {shop.phoneNumber ? (
            <DetailItem icon={Phone}>
              <a
                href={`tel:${shop.phoneNumber}`}
                className="transition-colors hover:text-[#2f5f49]"
              >
                {shop.phoneNumber}
              </a>
            </DetailItem>
          ) : null}
          {shop.email ? (
            <DetailItem icon={Mail}>
              <a
                href={`mailto:${shop.email}`}
                className="break-all transition-colors hover:text-[#2f5f49]"
              >
                {shop.email}
              </a>
            </DetailItem>
          ) : null}
          {joinedAt ? (
            <DetailItem icon={CalendarDays}>Bergabung {joinedAt}</DetailItem>
          ) : null}
        </div>

        {shop.address ? (
          <p className="mt-3 inline-flex items-start gap-1.5 text-sm text-[#5f7467]">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#8a6a3a]" />
            <span className="min-w-0 break-words">{shop.address}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
