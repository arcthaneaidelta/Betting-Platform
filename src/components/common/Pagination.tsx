import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-warm-border px-4 py-3.5 sm:flex-row">
      <p className="text-xs text-muted-grey tabular-nums">
        Showing <span className="font-medium text-charcoal">{start}</span> to{' '}
        <span className="font-medium text-charcoal">{end}</span> of{' '}
        <span className="font-medium text-charcoal">{totalItems}</span> records
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-btn border border-warm-border bg-soft-white text-charcoal transition-colors hover:bg-ivory disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-9 min-w-[36px] items-center justify-center rounded-btn px-2.5 text-xs font-medium tabular-nums transition-colors ${
              p === currentPage
                ? 'bg-forest text-soft-white'
                : 'border border-warm-border bg-soft-white text-charcoal hover:bg-ivory'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-btn border border-warm-border bg-soft-white text-charcoal transition-colors hover:bg-ivory disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

