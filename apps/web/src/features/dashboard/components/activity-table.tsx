'use client';

import {
  Badge,
  Skeleton,
  EmptyState,
  IconDocument,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { formatISOToJalali } from '@/shared/lib/date';
import { DataErrorState } from '@/features/shared';
import { useInvoices, type InvoiceDto } from '@/features/invoices/hooks/use-invoices';

const dash = t('dashboard');
const common = t('common');
const inv = t('invoice');

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  CONFIRMED: 'success',
  DRAFT: 'warning',
  CANCELLED: 'danger',
};

const statusLabel: Record<string, string> = {
  CONFIRMED: inv.statuses.confirmed,
  DRAFT: inv.statuses.draft,
  CANCELLED: inv.statuses.cancelled,
};

export function ActivityTable() {
  const { data, isLoading, isError, error, refetch } = useInvoices({ page: 1, pageSize: 5 });
  const invoices = data?.data ?? [];

  return (
    <div className="glass-surface-static flex flex-col gap-4 rounded-2xl p-5">
      <h2 className="text-base font-semibold text-fg-primary">{dash.recentActivity}</h2>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && invoices.length === 0 && (
        <EmptyState
          icon={<IconDocument size={20} />}
          title={common.noData}
          description={dash.noActivityYet}
        />
      )}

      {!isLoading && !isError && invoices.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{common.type}</TableHead>
              <TableHead>{common.name}</TableHead>
              <TableHead>{common.date}</TableHead>
              <TableHead>{common.status}</TableHead>
              <TableHead>{common.amount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((row: InvoiceDto) => (
              <TableRow key={row.id}>
                <TableCell className="text-fg-secondary">{row.invoiceNumber}</TableCell>
                <TableCell className="font-medium">
                  {row.customer?.name ?? row.vendor?.name ?? '—'}
                </TableCell>
                <TableCell className="text-fg-secondary">
                  {formatISOToJalali(row.invoiceDate, 'short')}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status] ?? 'warning'}>
                    {statusLabel[row.status] ?? row.status}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums font-semibold">
                  {formatMoney(row.totalAmount, { showUnit: false })}
                  <span className="ms-1 text-xs font-normal text-fg-tertiary">{common.toman}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
