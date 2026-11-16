'use client';

import { useCategories } from '@/hooks/use-categories';
import Link from 'next/link';

export function CategoryFilter() {
  const { data: categories = [], isPending } = useCategories();

  return (
    <nav
      aria-label="Kategori wastra"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {isPending
        ? Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="h-10 w-32 shrink-0 animate-pulse rounded-full bg-surface"
            />
          ))
        : categories.map((category) => (
            <Link
              key={category}
              href={`/encyclopedia?topic=${encodeURIComponent(category)}`}
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-surface px-4 text-[15px] whitespace-nowrap text-ink transition-colors hover:bg-brand hover:text-on-field active:scale-95"
            >
              {category}
            </Link>
          ))}
    </nav>
  );
}
