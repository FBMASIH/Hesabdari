'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  EmptyState,
  ConfirmDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableTableHead,
  IconPlus,
  IconDocument,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { formatISOToJalali } from '@/shared/lib/date';
import {
  DataPageHeader,
  DataFilterBar,
  DataTableSkeleton,
  DataErrorState,
  TableRowActions,
  TablePaginationFooter,
  type FilterPill,
} from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import {
  usePaidCheques,
  useDeletePaidCheque,
  type PaidChequeDto,
  type PaidChequeStatus,
} from '../hooks/use-paid-cheques';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';
import type { SortState } from '@hesabdari/ui';

const tr = t('treasury');
const common = t('common');
const msgs = t('messages');

const statusBadgeVariant: Record<
  PaidChequeStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
> = {
  OPEN: 'outline',
  CLEARED: 'success',
  RETURNED: 'danger',
  CANCELLED: 'secondary',
};

function statusLabel(status: PaidChequeStatus): string {
  return tr.chequeStatuses[status.toLowerCase() as keyof typeof tr.chequeStatuses] ?? status;
}

interface PaidChequeListPageProps {
  initialData?: PaginatedResponse<PaidChequeDto>;
}

export function PaidChequeListPage({ initialData }: PaidChequeListPageProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<PaidChequeDto | null>(null);
  const [sort, setSort] = useState<SortState | null>(null);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
    setPage(1);
  }

  const debouncedSearch = useDebounce(search);
  const isDefaultQuery = page === 1 && !debouncedSearch && !statusFilter && !sort;

  const { data, isLoading, isError, error, refetch } = usePaidCheques(
    {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      status: statusFilter ? (statusFilter as PaidChequeStatus) : undefined,
      sortBy: sort?.key,
      sortOrder: sort?.direction,
    },
    isDefaultQuery ? initialData : undefined,
  );

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
        showToast({
          title: err instanceof ApiError ? err.message : msgs.unexpectedError,
          variant: 'error',
        });
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
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={tr.searchPaidCheque}
        filters={filters}
        onFilterToggle={(key) => {
          setStatusFilter(key);
          setPage(1);
        }}
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
                action={
                  !search && !statusFilter ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push('/paid-cheques/new')}
                    >
                      <IconPlus size={14} /> {tr.newPaidCheque}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="chequeNumber" sort={sort} onSort={toggleSort}>
                    {tr.chequeNumber}
                  </SortableTableHead>
                  <SortableTableHead sortKey="vendor.name" sort={sort} onSort={toggleSort}>
                    {tr.paidChequeVendor}
                  </SortableTableHead>
                  <SortableTableHead sortKey="bankAccount.name" sort={sort} onSort={toggleSort}>
                    {tr.bankAccount}
                  </SortableTableHead>
                  <SortableTableHead sortKey="amount" sort={sort} onSort={toggleSort}>
                    {tr.chequeAmount}
                  </SortableTableHead>
                  <SortableTableHead sortKey="date" sort={sort} onSort={toggleSort}>
                    {tr.chequeDate}
                  </SortableTableHead>
                  <SortableTableHead sortKey="dueDate" sort={sort} onSort={toggleSort}>
                    {tr.chequeDueDate}
                  </SortableTableHead>
                  <SortableTableHead sortKey="status" sort={sort} onSort={toggleSort}>
                    {common.status}
                  </SortableTableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">
                      {row.chequeNumber}
                    </TableCell>
                    <TableCell>{row.vendor?.name ?? '—'}</TableCell>
                    <TableCell>{row.bankAccount.name}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(row.amount, { showUnit: false })}
                    </TableCell>
                    <TableCell>{formatISOToJalali(row.date, 'short')}</TableCell>
                    <TableCell>{formatISOToJalali(row.dueDate, 'short')}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[row.status]}>
                        {statusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TableRowActions
                        onEdit={() => router.push(`/paid-cheques/${row.id}/edit` as never)}
                        onDelete={() => setDeleteTarget(row)}
                        deleteDisabled={deleteMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {items.length > 0 && (
            <TablePaginationFooter
              total={data?.total ?? 0}
              unitLabel={tr.paidCheque}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={msgs.deleteConfirm}
        description={
          deleteTarget
            ? `${tr.chequeNumber} ${deleteTarget.chequeNumber} ${msgs.deleteWarning}`
            : ''
        }
        confirmLabel={common.delete}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
