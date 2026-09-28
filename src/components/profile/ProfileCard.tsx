'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KawungPattern } from '@/components/wastra-hero';
import { authClient } from '@/lib/auth/auth-client';
import {
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

const ROLE_BADGES: Record<string, { label: string; icon: ReactNode }> = {
  admin: { label: 'Admin', icon: <ShieldCheck className="size-3.5" /> },
  seller: { label: 'Seller', icon: <Store className="size-3.5" /> },
};

function getInitials(name?: string | null) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return (
    words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)
  ).toUpperCase();
}

function InfoChip({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-[#e4ece3] ring-1 ring-white/15 backdrop-blur-sm">
      <span className="text-[#e8cb8d]">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}

export default function ProfileCard() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as
    | (NonNullable<typeof session>['user'] & {
        phoneNumber?: string | null;
        role?: string | null;
      })
    | undefined;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : '';
  const roleBadge = user?.role ? ROLE_BADGES[user.role] : undefined;
  const initials = getInitials(user?.name);

  return (
    <div className="mx-4 my-4 md:mx-8">
      <div className="relative animate-in overflow-hidden rounded-3xl bg-gradient-to-br from-[#33664e] via-[#2f5e48] to-[#244a39] px-5 py-6 text-[#f2f7ef] shadow-[0_24px_48px_-28px_rgba(15,41,28,0.85)] duration-500 fade-in md:px-8 md:py-8">
        <KawungPattern className="inset-y-0 right-0 h-full w-2/3 text-[#e8cb8d] opacity-[0.08] [mask-image:linear-gradient(to_left,black_20%,transparent)]" />
        <span className="pointer-events-none absolute -top-20 right-1/4 size-64 rounded-full bg-[#e8cb8d]/15 blur-3xl" />

        <div className="relative flex flex-col items-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#f3dfb4] to-[#caa86a]" />
            <Avatar className="relative size-20 border-4 border-[#2f5e48] md:size-24">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.name || 'User'} />
              ) : null}
              <AvatarFallback className="bg-[#f5ead3] text-2xl font-bold text-[#2f5b49]">
                {initials || <UserRound className="size-9" />}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2.5 md:items-start">
            {isPending ? (
              <div className="h-7 w-40 animate-pulse rounded-lg bg-white/15" />
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {user?.name || 'Pengguna'}
                </h2>
                {roleBadge ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#caa86a] to-[#e8cb8d] px-2.5 py-0.5 text-xs font-semibold text-[#3c2e14]">
                    {roleBadge.icon}
                    {roleBadge.label}
                  </span>
                ) : null}
              </div>
            )}

            {isPending ? (
              <div className="h-6 w-64 animate-pulse rounded-full bg-white/10" />
            ) : (
              <div className="flex max-w-full flex-wrap justify-center gap-2 md:justify-start">
                <InfoChip icon={<Mail className="size-3.5" />}>
                  {user?.email || '-'}
                </InfoChip>
                {user?.phoneNumber ? (
                  <InfoChip icon={<Phone className="size-3.5" />}>
                    {user.phoneNumber}
                  </InfoChip>
                ) : null}
                {joinDate ? (
                  <InfoChip icon={<CalendarDays className="size-3.5" />}>
                    Bergabung {joinDate}
                  </InfoChip>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
