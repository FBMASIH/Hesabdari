import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../lib/utils';

/**
 * macOS-style data table — glass surface container, hairline separators,
 * generous RTL-aware padding, hover rows, sortable headers.
 */
export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="glass-surface-static overflow-hidden rounded-2xl">
      <div className="overflow-auto">
        <table ref={ref} className={cn('w-full text-sm', className)} {...props} />
      </div>
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-bg-tertiary/30 [&_tr]:border-b [&_tr]:border-border-secondary', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'group/row border-b border-border-secondary/50 transition-colors duration-150 hover:bg-bg-tertiary/40',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'py-3 pe-4 text-start align-middle text-xs font-medium text-fg-tertiary first:ps-5 last:pe-5',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'py-3.5 pe-4 align-middle text-sm text-fg-primary first:ps-5 last:pe-5',
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

// ── Sortable header ─────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface SortableTableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortKey: string;
  sort: SortState | null;
  onSort: (key: string) => void;
}

function ariaSort(direction: SortDirection | null): 'ascending' | 'descending' | 'none' {
  if (direction === 'asc') return 'ascending';
  if (direction === 'desc') return 'descending';
  return 'none';
}

export const SortableTableHead = forwardRef<HTMLTableCellElement, SortableTableHeadProps>(
  ({ className, sortKey, sort, onSort, children, ...props }, ref) => {
    const isActive = sort?.key === sortKey;
    const direction = isActive && sort ? sort.direction : null;

    return (
      <th
        ref={ref}
        className={cn(
          'py-3 pe-4 text-start align-middle text-xs font-medium first:ps-5 last:pe-5',
          'cursor-pointer select-none transition-colors duration-150 group/sort',
          isActive ? 'text-fg-primary' : 'text-fg-tertiary hover:text-fg-secondary',
          className,
        )}
        tabIndex={0}
        onClick={() => onSort(sortKey)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSort(sortKey);
          }
        }}
        role="columnheader"
        aria-sort={ariaSort(direction)}
        {...props}
      >
        <span className="inline-flex items-center gap-1.5">
          {children}
          <span
            className={cn(
              'inline-flex shrink-0 flex-col gap-[1px] transition-opacity duration-150',
              isActive ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-60',
            )}
          >
            <svg
              width="8"
              height="5"
              viewBox="0 0 8 5"
              aria-hidden="true"
              className={direction === 'asc' ? 'text-brand-deep' : 'text-fg-tertiary/40'}
            >
              <path d="M4 0.5L7.5 4.5H0.5L4 0.5Z" fill="currentColor" />
            </svg>
            <svg
              width="8"
              height="5"
              viewBox="0 0 8 5"
              aria-hidden="true"
              className={direction === 'desc' ? 'text-brand-deep' : 'text-fg-tertiary/40'}
            >
              <path d="M4 4.5L0.5 0.5H7.5L4 4.5Z" fill="currentColor" />
            </svg>
          </span>
        </span>
      </th>
    );
  },
);
SortableTableHead.displayName = 'SortableTableHead';
