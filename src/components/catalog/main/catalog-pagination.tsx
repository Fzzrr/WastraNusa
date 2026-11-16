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
    <div className="mt-7 border-t border-[#d7cebf] pt-4">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-md border-[#dad2c4] bg-[#f8f4eb] text-xs"
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
              className="rounded-md border-[#dad2c4] bg-[#f8f4eb] text-[#4e6558]"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            <span className="px-1 text-[#7b776d]">...</span>
          </>
        ) : null}

        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon-sm"
            className={cn(
              'rounded-md',
              page === currentPage
                ? 'bg-[#2f5f49] text-[#edf4ec] hover:bg-[#244938]'
                : 'border-[#dad2c4] bg-[#f8f4eb] text-[#4e6558]',
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages ? (
          <>
            <span className="px-1 text-[#7b776d]">...</span>
            <Button
              variant={totalPages === currentPage ? 'default' : 'outline'}
              size="icon-sm"
              className="rounded-md border-[#dad2c4] bg-[#f8f4eb] text-[#4e6558]"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="rounded-md border-[#dad2c4] bg-[#f8f4eb] text-xs"
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
