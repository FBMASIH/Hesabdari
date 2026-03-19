'use client';

import { Pagination } from '@hesabdari/ui';
import { toPersianDigits } from '@/shared/lib/date';

export interface TablePaginationFooterProps {
  total: number;
  /** The unit label displayed after the total count (e.g. "مشتری", "فاکتور"). */
  unitLabel: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePaginationFooter({
  total,
  unitLabel,
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationFooterProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-fg-tertiary">
        {toPersianDigits(total)} {unitLabel}
      </span>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
