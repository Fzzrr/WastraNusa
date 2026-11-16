'use client';

import { Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface PaymentDeadlineBadgeProps {
  deadlineAt: string | null;
  onExpire?: () => void;
}

function getRemainingMs(deadlineAt: string | null) {
  if (!deadlineAt) return 0;

  const deadline = new Date(deadlineAt).getTime();
  return Math.max(0, deadline - Date.now());
}

function getRemainingMsFromNow(
  deadlineAt: string | null,
  currentTimeMs: number,
) {
  if (!deadlineAt) return 0;

  const deadline = new Date(deadlineAt).getTime();
  return Math.max(0, deadline - currentTimeMs);
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m ${seconds}d`;
  }

  return `${minutes}m ${seconds}d`;
}

export function PaymentDeadlineBadge({
  deadlineAt,
  onExpire,
}: PaymentDeadlineBadgeProps) {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const hasExpiredRef = useRef(getRemainingMs(deadlineAt) === 0);

  const remainingMs = useMemo(
    () => getRemainingMsFromNow(deadlineAt, currentTimeMs),
    [currentTimeMs, deadlineAt],
  );

  useEffect(() => {
    if (!deadlineAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [deadlineAt]);

  useEffect(() => {
    if (remainingMs > 0) {
      hasExpiredRef.current = false;
      return;
    }

    if (deadlineAt && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire?.();
    }
  }, [deadlineAt, onExpire, remainingMs]);

  if (!deadlineAt) {
    return null;
  }

  if (remainingMs === 0) {
    return (
      <div className="rounded-lg border border-[#ead7cf] bg-[#fdf6f2] px-3 py-2 text-xs text-[#a06651]">
        Masa pembayaran telah habis. Pesanan akan dibatalkan otomatis.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#e7dbc9] bg-[#fff8ed] px-3 py-2 text-xs text-[#8a6a3f] flex items-center gap-2">
      <Clock className="size-3.5 shrink-0 text-[#8a6a3f]" />
      <span>
        Sisa waktu bayar:{' '}
        <span className="font-semibold">
          {formatRemainingTime(remainingMs)}
        </span>
      </span>
    </div>
  );
}
