import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  const maxVisiblePages = 3;
  const startPage = Math.max(
    1,
    Math.min(currentPage - 1, totalPages - maxVisiblePages + 1),
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-0 bg-transparent px-4 text-[15px] text-ink hover:bg-surface"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-1 size-4" />
          Sebelumnya
        </Button>

        {startPage > 1 ? (
          <>
            <Button
              variant={currentPage === 1 ? 'default' : 'outline'}
              size="icon-sm"
              className="size-10 rounded-full border-0 bg-transparent text-[15px] text-ink tabular-nums hover:bg-surface"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            <span className="px-1 text-ink-soft">...</span>
          </>
        ) : null}

        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon-sm"
            className={cn(
              'size-10 rounded-full border-0 text-[15px] tabular-nums',
              page === currentPage
                ? 'bg-brand font-semibold text-on-field hover:bg-brand-strong'
                : 'bg-transparent text-ink hover:bg-surface',
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages ? (
          <>
            <span className="px-1 text-ink-soft">...</span>
            <Button
              variant={totalPages === currentPage ? 'default' : 'outline'}
              size="icon-sm"
              className="size-10 rounded-full border-0 bg-transparent text-[15px] text-ink tabular-nums hover:bg-surface"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-0 bg-transparent px-4 text-[15px] text-ink hover:bg-surface"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Berikutnya
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
