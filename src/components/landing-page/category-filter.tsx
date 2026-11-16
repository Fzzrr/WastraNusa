'use client';

import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/use-categories';
import { Tags } from 'lucide-react';
import Link from 'next/link';

export function CategoryFilter() {
  const { data: categories = [], isPending } = useCategories();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4f6658]">
        <Tags className="size-4 text-[#b08a5e]" />
        Kategori:
      </span>
      <div className="flex flex-wrap gap-2">
        {isPending ? (
          <div className="h-8 w-32 animate-pulse rounded-full bg-[#e8dfd4]" />
        ) : (
          categories.map((category) => (
            <Button
              key={category}
              asChild
              variant="outline"
              className="rounded-full border border-[#4a3a2a]/[14.5%] bg-gradient-to-b from-white/70 to-[#4a3a2a]/[6.3%] px-4 py-1.5 text-sm font-medium text-[#2f4f3f] shadow-[0_1px_2px_rgba(60,41,15,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#2f4f3f] hover:from-[#2f4f3f] hover:to-[#3f6b55] hover:text-white hover:shadow-[0_8px_18px_-10px_rgba(47,79,63,0.8)] active:scale-95"
            >
              <Link
                href={`/encyclopedia?topic=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
