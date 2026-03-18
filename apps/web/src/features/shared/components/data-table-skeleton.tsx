import { Skeleton, cn } from '@hesabdari/ui';

export interface DataTableSkeletonProps {
  /** Number of columns to render. */
  columns: number;
  /** Number of rows to render. Default: 5 */
  rows?: number;
}

export function DataTableSkeleton({ columns, rows = 5 }: DataTableSkeletonProps) {
  return (
    <div className="glass-surface-static overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex gap-4 border-b border-border-secondary px-5 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex gap-4 border-b border-border-secondary/50 px-5 py-4 last:border-0"
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton
              key={col}
              className={cn('h-4 flex-1', col === 0 && 'max-w-[100px]')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
