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
  IconPen,
  IconBan,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { formatISOToJalali, toPersianDigits } from '@/shared/lib/date';
import {
  DataPageHeader,
  DataFilterBar,
  DataTableSkeleton,
  DataErrorState,
  TablePaginationFooter,
  type FilterPill,
} from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableSort } from '@/shared/hooks/use-table-sort';
import { useInvoices, useCancelInvoice, type InvoiceDto } from '../hooks/use-invoices';
import { ApiError } from '@hesabdari/api-client';

const inv = t('invoice');
const common = t('common');
const msgs = t('messages');

type DocumentType = InvoiceDto['documentType'];
type InvoiceStatus = InvoiceDto['status'];

const docTypeLabel: Record<DocumentType, string> = {
  SALES: inv.types.sales,
  PURCHASE: inv.types.purchase,
  SALES_RETURN: inv.types.salesReturn,
  PURCHASE_RETURN: inv.types.purchaseReturn,
  PROFORMA: inv.types.proforma,
};

const statusLabel: Record<InvoiceStatus, string> = {
  DRAFT: inv.statuses.draft,
  CONFIRMED: inv.statuses.confirmed,
  CANCELLED: inv.statuses.cancelled,
};

const statusVariant: Record<InvoiceStatus, 'warning' | 'success' | 'danger'> = {
  DRAFT: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
};

export function InvoiceListPage() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<InvoiceDto | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch } = useInvoices({
    page,
    pageSize: 10,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const cancelMutation = useCancelInvoice();

  const filters: FilterPill[] = [
    { key: '', label: common.all, active: statusFilter === '' },
    { key: 'DRAFT', label: inv.statuses.draft, active: statusFilter === 'DRAFT' },
    { key: 'CONFIRMED', label: inv.statuses.confirmed, active: statusFilter === 'CONFIRMED' },
    { key: 'CANCELLED', label: inv.statuses.cancelled, active: statusFilter === 'CANCELLED' },
  ];

  function handleFilterToggle(key: string) {
    setStatusFilter(key);
    setPage(1);
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget.id, {
      onSuccess: () => {
        showToast({ title: inv.cancelledToast(cancelTarget.invoiceNumber), variant: 'success' });
        setCancelTarget(null);
      },
      onError: (err) => {
        const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
        showToast({ title: msg, variant: 'error' });
      },
    });
  }

  function partyName(row: InvoiceDto): string {
    return row.customer?.name ?? row.vendor?.name ?? '—';
  }

  const invoices = data?.data ?? [];
  const { sort, toggleSort, sorted } = useTableSort(invoices);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={inv.title}
        subtitle={inv.subtitle}
        action={{
          label: inv.newInvoice,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/invoices/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={inv.searchPlaceholder}
        filters={filters}
        onFilterToggle={handleFilterToggle}
      />

      {isLoading && <DataTableSkeleton columns={7} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {invoices.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search || statusFilter ? common.noResults : common.noData}
                description={search ? inv.noInvoiceFound : inv.noInvoiceYet}
                icon={<IconDocument size={20} />}
                action={
                  !search && !statusFilter ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push('/invoices/new')}
                    >
                      <IconPlus size={14} /> {inv.newInvoice}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="invoiceNumber" sort={sort} onSort={toggleSort}>
                    {inv.invoiceNumber}
                  </SortableTableHead>
                  <SortableTableHead sortKey="documentType" sort={sort} onSort={toggleSort}>
                    {inv.documentType}
                  </SortableTableHead>
                  <SortableTableHead sortKey="invoiceDate" sort={sort} onSort={toggleSort}>
                    {inv.invoiceDate}
                  </SortableTableHead>
                  <TableHead>{common.counterparty}</TableHead>
                  <SortableTableHead sortKey="status" sort={sort} onSort={toggleSort}>
                    {common.status}
                  </SortableTableHead>
                  <SortableTableHead sortKey="totalAmount" sort={sort} onSort={toggleSort}>
                    {common.amount}
                  </SortableTableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {toPersianDigits(row.invoiceNumber)}
                    </TableCell>
                    <TableCell className="text-fg-secondary">
                      {docTypeLabel[row.documentType]}
                    </TableCell>
                    <TableCell className="tabular-nums text-fg-secondary">
                      {formatISOToJalali(row.invoiceDate, 'short')}
                    </TableCell>
                    <TableCell>{partyName(row)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums font-semibold">
                      {formatMoney(row.totalAmount, { showUnit: false })}
                      <span className="ms-1 text-xs font-normal text-fg-tertiary">
                        {common.toman}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => router.push(`/invoices/${row.id}/edit` as never)}
                          aria-label={inv.viewInvoiceAriaLabel(row.invoiceNumber)}
                          title={common.edit}
                        >
                          <IconPen size={14} />
                        </Button>
                        {row.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:bg-danger-subtle hover:text-danger-default"
                            onClick={() => setCancelTarget(row)}
                            disabled={cancelMutation.isPending}
                            aria-label={inv.cancelInvoice}
                            title={inv.cancelInvoice}
                          >
                            <IconBan size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {invoices.length > 0 && (
            <TablePaginationFooter
              total={data?.total ?? 0}
              unitLabel={inv.invoiceCount}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title={inv.cancelConfirmTitle}
        description={cancelTarget ? inv.cancelConfirmDescription(cancelTarget.invoiceNumber) : ''}
        confirmLabel={inv.cancelConfirmLabel}
        variant="danger"
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
