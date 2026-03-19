import { type ReactNode } from 'react';
import { Skeleton } from '@hesabdari/ui';

/* ── Composable building blocks ──────────────────────────── */

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-6 py-4 animate-fade-in">
      {children}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
  );
}

function TableRowCells() {
  return (
    <>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20" />
    </>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="glass-surface-static overflow-hidden rounded-2xl">
      <div className="flex gap-4 border-b border-border-secondary px-6 py-4">
        <TableRowCells />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-border-secondary/50 px-6 py-4 last:border-0"
        >
          <TableRowCells />
        </div>
      ))}
    </div>
  );
}

function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass-surface-static rounded-2xl p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

/* ── Page-level skeletons ────────────────────────────────── */

/** List pages: header + search + data table (invoices, customers, etc.) */
export function ListPageSkeleton() {
  return (
    <PageWrapper>
      <HeaderSkeleton />
      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
      <TableSkeleton />
    </PageWrapper>
  );
}

/** Form pages: header + form fields (new customer, new invoice, etc.) */
export function FormPageSkeleton() {
  return (
    <PageWrapper>
      <HeaderSkeleton />
      <div className="glass-surface-static rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <FormFieldSkeleton />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </PageWrapper>
  );
}

/** Dashboard: KPI cards + chart + activity table */
export function DashboardSkeleton() {
  return (
    <PageWrapper>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <TableSkeleton rows={4} />
    </PageWrapper>
  );
}

/** Settings / accounting pages: header + content blocks */
export function ContentPageSkeleton() {
  return (
    <PageWrapper>
      <HeaderSkeleton />
      <div className="glass-surface-static rounded-2xl p-6 space-y-4">
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <div className="glass-surface-static rounded-2xl p-6 space-y-4">
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    </PageWrapper>
  );
}
