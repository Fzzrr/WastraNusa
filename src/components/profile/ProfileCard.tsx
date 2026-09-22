'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth/auth-client';
import { MapPin, User } from 'lucide-react';

export default function ProfileCard() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Format the join date
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="mx-4 md:mx-8 my-4 px-4 md:px-8 py-5 md:py-7 bg-background rounded-xl border flex flex-col md:flex-row justify-between items-center font-sans shadow-sm gap-4">
      <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-center text-center md:text-left">
        <Avatar className="size-20 md:size-18 border">
          {user?.image && (
            <AvatarImage src={user.image} alt={user.name || 'User'} />
          )}
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User size={32} />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1.5 items-center md:items-start">
          {isPending ? (
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          ) : (
            <h2 className="m-0 text-lg md:text-xl font-bold text-foreground">
              {user?.name || 'Pengguna'}
            </h2>
          )}

          {isPending ? (
            <div className="h-4 w-48 bg-muted animate-pulse rounded mt-1"></div>
          ) : (
            <p className="m-0 text-[13px] text-muted-foreground break-all md:break-normal">
              {user?.email || 'email@example.com'}
              {user?.phoneNumber ? ` | ${user.phoneNumber}` : ''}
            </p>
          )}

          {isPending ? (
            <div className="h-3 w-40 bg-muted animate-pulse rounded mt-1"></div>
          ) : (
            <p className="m-0 text-[12px] text-muted-foreground flex items-center justify-center md:justify-start gap-1">
              <MapPin size={13} />
              {joinDate || 'Januari 2024'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
