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
  IconBan,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { formatISOToJalali, toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataFilterBar, DataTableSkeleton, DataErrorState, type FilterPill } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useInvoices, useCancelInvoice, type InvoiceDto } from '../hooks/use-invoices';
import { ApiError } from '@hesabdari/api-client';

// ── i18n lookups ────────────────────────────────────

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

// ── Component ───────────────────────────────────────

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

  const partyName = (row: InvoiceDto) => row.customer?.name ?? row.vendor?.name ?? '—';
  const invoices = data?.data ?? [];
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
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={inv.searchPlaceholder}
        filters={filters}
        onFilterToggle={handleFilterToggle}
      />

      {/* Loading */}
      {isLoading && <DataTableSkeleton columns={7} rows={5} />}

      {/* Error */}
      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {/* Data */}
      {!isLoading && !isError && (
        <>
          {invoices.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search || statusFilter ? common.noResults : common.noData}
                description={search ? inv.noInvoiceFound : inv.noInvoiceYet}
                icon={<IconDocument size={20} />}
                action={!search && !statusFilter ? (
                  <Button variant="default" size="sm" onClick={() => router.push('/invoices/new')}>
                    <IconPlus size={14} /> {inv.newInvoice}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{inv.invoiceNumber}</TableHead>
                  <TableHead>{inv.documentType}</TableHead>
                  <TableHead>{inv.invoiceDate}</TableHead>
                  <TableHead>{common.counterparty}</TableHead>
                  <TableHead>{common.status}</TableHead>
                  <TableHead>{common.amount}</TableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((row) => (
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
                    <TableCell>
                      {partyName(row)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[row.status]}>
                        {statusLabel[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums font-semibold">
                      {formatMoney(row.totalAmount, { showUnit: false })}
                      <span className="ms-1 text-xs font-normal text-fg-tertiary">{common.toman}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="xs"
                          aria-label={inv.viewInvoiceAriaLabel(row.invoiceNumber)}
                        >
                          <IconPen size={12} /> {common.edit}
                        </Button>
                        {row.status === 'DRAFT' && (
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => setCancelTarget(row)}
                            disabled={cancelMutation.isPending}
                          >
                            <IconBan size={12} /> {inv.cancelInvoice}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {invoices.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-fg-tertiary">
                {toPersianDigits(data?.total ?? 0)} {inv.invoiceCount}
              </span>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title={inv.cancelConfirmTitle}
        description={cancelTarget ? inv.cancelConfirmDescription(cancelTarget.invoiceNumber) : ''}
        confirmLabel={inv.cancelConfirmLabel}
        variant="danger"
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
