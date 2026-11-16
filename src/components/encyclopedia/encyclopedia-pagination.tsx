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
          className={`h-8 w-8 rounded border text-sm font-semibold transition ${
            i === currentPage
              ? 'border-[#2f5f49] bg-[#2f5f49] text-[#eef3ea] hover:bg-[#2f5f49]/90 hover:text-[#eef3ea]'
              : 'border-[#d6cdbc] bg-[#f7f3ea] text-[#53675a] hover:bg-[#ede7da]'
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
        <span key="ellipsis" className="text-sm text-[#8f918a]">
          ...
        </span>,
      );

      // Show last page
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded border border-[#d6cdbc] bg-[#f7f3ea] text-sm font-semibold text-[#53675a] hover:bg-[#ede7da] transition"
          onClick={() => onPageChange?.(totalPages)}
        >
          {totalPages}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded border border-[#d6cdbc] bg-[#f7f3ea] text-[#6f7f73] hover:bg-[#ede7da] transition"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded border border-[#d6cdbc] bg-[#f7f3ea] text-[#6f7f73] hover:bg-[#ede7da] transition"
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
