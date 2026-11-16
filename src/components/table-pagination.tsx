import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Pages to show: all when there are 5 or fewer, else first, last and current ±1. */
function visiblePages(page: number, totalPages: number) {
  return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
}

const navButtonClassName =
  'size-8 cursor-pointer rounded-lg border-[#e5ded5] bg-[#fffdfa] text-[#6f6a62] hover:bg-[#f4efe5]';

/** Numbered pagination for dashboard tables. Renders nothing for one page. */
export function TablePagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-[#efe8dd] px-5 py-4',
        className,
      )}
    >
      <p className="text-sm text-[#9a8f80]">
        Halaman <span className="font-semibold text-[#2f4f3f]">{page}</span>{' '}
        dari {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Halaman sebelumnya"
          className={navButtonClassName}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || disabled}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages(page, totalPages).map((p, i, pages) => (
            <div key={p} className="flex items-center gap-1">
              {i > 0 && p - pages[i - 1] > 1 ? (
                <span className="px-1 text-[#9a8f80]">…</span>
              ) : null}
              <Button
                variant="outline"
                size="icon"
                aria-label={`Halaman ${p}`}
                aria-current={page === p ? 'page' : undefined}
                className={cn(
                  'size-8 cursor-pointer rounded-lg transition-all',
                  page === p
                    ? 'border-[#3a5a4a] bg-[#3a5a4a] text-white shadow-[0_4px_12px_rgba(47,75,61,0.25)] hover:bg-[#3a5a4a] hover:text-white'
                    : 'border-[#e5ded5] bg-[#fffdfa] text-[#6f6a62] hover:bg-[#f4efe5]',
                )}
                onClick={() => onPageChange(p)}
                disabled={disabled}
              >
                {p}
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Halaman berikutnya"
          className={navButtonClassName}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || disabled}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
