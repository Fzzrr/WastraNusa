'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <span className="inline-flex max-w-full items-center gap-1.5 text-[15px] text-on-field-soft">
      <span>{icon}</span>
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
      <div className="relative animate-in overflow-hidden bg-field px-5 py-8 text-on-field duration-500 fade-in md:px-10 md:py-10">
        <div className="relative flex flex-col items-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
          <div className="relative">
            <Avatar className="relative size-20 md:size-24">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.name || 'User'} />
              ) : null}
              <AvatarFallback className="bg-surface text-2xl font-bold text-ink">
                {initials || <UserRound className="size-9" />}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2.5 md:items-start">
            {isPending ? (
              <div className="h-7 w-40 animate-pulse rounded-lg bg-white/15" />
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em]">
                  {user?.name || 'Pengguna'}
                </h2>
                {roleBadge ? (
                  <span className="inline-flex items-center gap-1.5 text-[15px] text-gold">
                    {roleBadge.icon}
                    {roleBadge.label}
                  </span>
                ) : null}
              </div>
            )}

            {isPending ? (
              <div className="h-6 w-64 animate-pulse rounded-full bg-white/10" />
            ) : (
              <div className="flex max-w-full flex-wrap justify-center gap-x-5 gap-y-1 md:justify-start">
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
