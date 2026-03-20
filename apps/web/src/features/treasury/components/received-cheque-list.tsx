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
  useReceivedCheques,
  useDeleteReceivedCheque,
  type ReceivedChequeDto,
  type ReceivedChequeStatus,
} from '../hooks/use-received-cheques';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableSort } from '@/shared/hooks/use-table-sort';
import { ApiError } from '@hesabdari/api-client';

const tr = t('treasury');
const common = t('common');
const msgs = t('messages');

const statusBadgeVariant: Record<
  ReceivedChequeStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
> = {
  OPEN: 'outline',
  DEPOSITED: 'default',
  CASHED: 'success',
  BOUNCED: 'danger',
  RETURNED: 'warning',
  CANCELLED: 'secondary',
};

function statusLabel(status: ReceivedChequeStatus): string {
  return tr.chequeStatuses[status.toLowerCase() as keyof typeof tr.chequeStatuses] ?? status;
}

interface ReceivedChequeListPageProps {
  initialData?: PaginatedResponse<ReceivedChequeDto>;
}

export function ReceivedChequeListPage({ initialData }: ReceivedChequeListPageProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ReceivedChequeDto | null>(null);

  const debouncedSearch = useDebounce(search);
  const isDefaultQuery = page === 1 && !debouncedSearch && !statusFilter;

  const { data, isLoading, isError, error, refetch } = useReceivedCheques(
    {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      status: statusFilter ? (statusFilter as ReceivedChequeStatus) : undefined,
    },
    isDefaultQuery ? initialData : undefined,
  );

  const deleteMutation = useDeleteReceivedCheque();

  const filters: FilterPill[] = [
    { key: '', label: common.all, active: statusFilter === '' },
    { key: 'OPEN', label: tr.chequeStatuses.open, active: statusFilter === 'OPEN' },
    { key: 'DEPOSITED', label: tr.chequeStatuses.deposited, active: statusFilter === 'DEPOSITED' },
    { key: 'CASHED', label: tr.chequeStatuses.cashed, active: statusFilter === 'CASHED' },
    { key: 'BOUNCED', label: tr.chequeStatuses.bounced, active: statusFilter === 'BOUNCED' },
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
  const { sort, toggleSort, sorted } = useTableSort(items);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={tr.receivedChequeTitle}
        subtitle={tr.receivedChequeSubtitle}
        action={{
          label: tr.newReceivedCheque,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/received-cheques/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={tr.searchReceivedCheque}
        filters={filters}
        onFilterToggle={(key) => {
          setStatusFilter(key);
          setPage(1);
        }}
      />

      {isLoading && <DataTableSkeleton columns={7} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {items.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search || statusFilter ? common.noResults : common.noData}
                description={
                  search || statusFilter ? tr.noReceivedChequeFound : tr.noReceivedChequeYet
                }
                icon={<IconDocument size={20} />}
                action={
                  !search && !statusFilter ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push('/received-cheques/new')}
                    >
                      <IconPlus size={14} /> {tr.newReceivedCheque}
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
                  <SortableTableHead sortKey="customer.name" sort={sort} onSort={toggleSort}>
                    {tr.drawer}
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
                {sorted.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">
                      {row.chequeNumber}
                    </TableCell>
                    <TableCell>{row.customer.name}</TableCell>
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
                        onEdit={() => router.push(`/received-cheques/${row.id}/edit` as never)}
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
              unitLabel={tr.receivedCheque}
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
