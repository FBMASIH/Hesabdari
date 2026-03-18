import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../lib/utils';

/**
 * macOS-style data table — glass surface container, hairline separators,
 * generous RTL-aware padding, hover rows.
 *
 * Usage:
 *   <Table>
 *     <TableHeader><TableRow><TableHead>...</TableHead></TableRow></TableHeader>
 *     <TableBody><TableRow><TableCell>...</TableCell></TableRow></TableBody>
 *   </Table>
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
  <thead ref={ref} className={cn('[&_tr]:border-b [&_tr]:border-border-secondary', className)} {...props} />
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
        'border-b border-border-secondary/50 transition-colors hover:bg-bg-primary/40',
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
