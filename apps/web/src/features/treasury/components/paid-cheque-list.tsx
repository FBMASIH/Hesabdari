'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Pagination,
  EmptyState,
  ConfirmDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  IconPlus,
  IconDocument,
  IconPen,
  IconTrash,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { formatISOToJalali, toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataFilterBar, DataTableSkeleton, DataErrorState, type FilterPill } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { usePaidCheques, useDeletePaidCheque, type PaidChequeDto, type PaidChequeStatus } from '../hooks/use-paid-cheques';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';

const tr = t('treasury');
const common = t('common');
const msgs = t('messages');

const statusBadgeVariant: Record<PaidChequeStatus, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
  OPEN: 'outline',
  CLEARED: 'success',
  RETURNED: 'danger',
  CANCELLED: 'secondary',
};

function statusLabel(status: PaidChequeStatus): string {
  return tr.chequeStatuses[status.toLowerCase() as keyof typeof tr.chequeStatuses] ?? status;
}

export function PaidChequeListPage() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<PaidChequeDto | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch } = usePaidCheques({
    page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    status: statusFilter ? statusFilter as PaidChequeStatus : undefined,
  });

  const deleteMutation = useDeletePaidCheque();

  const filters: FilterPill[] = [
    { key: '', label: common.all, active: statusFilter === '' },
    { key: 'OPEN', label: tr.chequeStatuses.open, active: statusFilter === 'OPEN' },
    { key: 'CLEARED', label: tr.chequeStatuses.cleared, active: statusFilter === 'CLEARED' },
    { key: 'RETURNED', label: tr.chequeStatuses.returned, active: statusFilter === 'RETURNED' },
    { key: 'CANCELLED', label: tr.chequeStatuses.cancelled, active: statusFilter === 'CANCELLED' },
  ];

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast({ title: msgs.deleteSuccess, variant: 'success' });
        setDeleteTarget(null);
      },
      onError: (err) => {
        showToast({ title: err instanceof ApiError ? err.message : msgs.unexpectedError, variant: 'error' });
      },
    });
  }

  const items = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={tr.paidChequeTitle}
        subtitle={tr.paidChequeSubtitle}
        action={{
          label: tr.newPaidCheque,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/paid-cheques/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={tr.searchPaidCheque}
        filters={filters}
        onFilterToggle={(key) => { setStatusFilter(key); setPage(1); }}
      />

      {isLoading && <DataTableSkeleton columns={8} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {items.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search || statusFilter ? common.noResults : common.noData}
                description={search || statusFilter ? tr.noPaidChequeFound : tr.noPaidChequeYet}
                icon={<IconDocument size={20} />}
                action={!search && !statusFilter ? (
                  <Button variant="default" size="sm" onClick={() => router.push('/paid-cheques/new')}>
                    <IconPlus size={14} /> {tr.newPaidCheque}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tr.chequeNumber}</TableHead>
                  <TableHead>{tr.paidChequeVendor}</TableHead>
                  <TableHead>{tr.bankAccount}</TableHead>
                  <TableHead>{tr.chequeAmount}</TableHead>
                  <TableHead>{tr.chequeDate}</TableHead>
                  <TableHead>{tr.chequeDueDate}</TableHead>
                  <TableHead>{common.status}</TableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">{row.chequeNumber}</TableCell>
                    <TableCell>{row.vendor?.name ?? '—'}</TableCell>
                    <TableCell>{row.bankAccount.name}</TableCell>
                    <TableCell className="tabular-nums">{formatMoney(row.amount, { showUnit: false })}</TableCell>
                    <TableCell>{formatISOToJalali(row.date, 'short')}</TableCell>
                    <TableCell>{formatISOToJalali(row.dueDate, 'short')}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[row.status]}>
                        {statusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="xs" onClick={() => router.push(`/paid-cheques/${row.id}/edit` as never)}><IconPen size={12} /> {common.edit}</Button>
                        <Button variant="danger" size="xs" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget(row)}>
                          <IconTrash size={12} /> {common.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {items.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-fg-tertiary">{toPersianDigits(data?.total ?? 0)} {tr.paidCheque}</span>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={msgs.deleteConfirm}
        description={deleteTarget ? `${tr.chequeNumber} ${deleteTarget.chequeNumber} ${msgs.deleteWarning}` : ''}
        confirmLabel={common.delete}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
