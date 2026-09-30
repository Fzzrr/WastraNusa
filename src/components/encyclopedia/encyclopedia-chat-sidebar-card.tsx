'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MessageSquare, Sparkles } from 'lucide-react';

interface EncyclopediaChatSidebarCardProps {
  onOpenChat: () => void;
  className?: string;
}

export function EncyclopediaChatSidebarCard({
  onOpenChat,
  className,
}: EncyclopediaChatSidebarCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#f8f3ea] via-[#fbf8f2] to-[#f4ebe0] p-4.5 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e6dccb]',
        className,
      )}
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-[#caa86a]/15 blur-2xl" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#2f5b49] text-[#f5ead3] shadow-xs">
          <Sparkles className="size-4 text-[#caa86a]" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-[#2f5b49]">
            Tanya Asisten Wastra
          </h3>
          <p className="text-[11px] text-[#7d7465]">
            Q&A Cerdas Berbasis Artikel
          </p>
        </div>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-[#5e5549]">
        Ingin tahu lebih dalam tentang makna motif, sejarah, atau teknik kain
        ini? Tanyakan langsung ke asisten AI kami.
      </p>

      <Button
        type="button"
        onClick={onOpenChat}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f5b49] py-2.5 text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgba(47,91,73,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#254b3c] active:scale-[0.98]"
      >
        <MessageSquare className="size-3.5 text-[#caa86a]" />
        Buka Tanya Jawab AI
      </Button>
    </Card>
  );
}
