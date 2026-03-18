'use client';

import { cn } from '../lib/utils';
import { IconChevronRight, IconChevronLeft } from '../icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Aria-label for the nav element. Default: 'صفحه‌بندی' */
  navLabel?: string;
  /** Aria-label for previous button. Default: 'صفحه قبلی' */
  previousLabel?: string;
  /** Aria-label for next button. Default: 'صفحه بعدی' */
  nextLabel?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className, navLabel = 'صفحه‌بندی', previousLabel = 'صفحه قبلی', nextLabel = 'صفحه بعدی' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label={navLabel} className={cn('flex items-center justify-center gap-1', className)}>
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={previousLabel}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary transition-colors hover:bg-bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        <IconChevronRight size={16} />
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-fg-tertiary">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            aria-current={page === currentPage ? ('page' as const) : undefined}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg tabular-nums text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-brand-deep text-primary-fg'
                : 'text-fg-secondary hover:bg-bg-secondary',
            )}
          >
            {toPersianDigit(page as number)}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={nextLabel}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary transition-colors hover:bg-bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        <IconChevronLeft size={16} />
      </button>
    </nav>
  );
}

/** Persian digit conversion for page numbers. */
function toPersianDigit(n: number): string {
  const digits: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
  };
  return String(n).replace(/\d/g, (d) => digits[d] ?? d);
}

/** Calculate visible page numbers with ellipsis. */
function getVisiblePages(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
