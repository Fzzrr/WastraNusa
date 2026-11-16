import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EncyclopediaPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function EncyclopediaPagination({
  currentPage,
  totalPages,
  onPageChange,
}: EncyclopediaPaginationProps) {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    // Always show first 3 pages
    for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="icon"
          className={`size-10 rounded-full border-0 text-[15px] tabular-nums transition-colors ${
            i === currentPage
              ? 'bg-brand font-semibold text-on-field hover:bg-brand-strong hover:text-on-field'
              : 'bg-transparent text-ink hover:bg-surface'
          }`}
          onClick={() => onPageChange?.(i)}
        >
          {i}
        </Button>,
      );
    }

    // Show ellipsis if there are more pages
    if (totalPages > maxVisiblePages + 1) {
      pages.push(
        <span key="ellipsis" className="text-[15px] text-ink-soft">
          ...
        </span>,
      );

      // Show last page
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="icon"
          className="size-10 rounded-full border-0 bg-transparent text-[15px] text-ink transition-colors hover:bg-surface"
          onClick={() => onPageChange?.(totalPages)}
        >
          {totalPages}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full border-0 bg-transparent text-ink transition-colors hover:bg-surface disabled:opacity-30"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full border-0 bg-transparent text-ink transition-colors hover:bg-surface disabled:opacity-30"
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
