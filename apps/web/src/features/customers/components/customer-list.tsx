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
  IconUsersGroup,
  IconPen,
  IconTrash,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataFilterBar, DataTableSkeleton, DataErrorState, type FilterPill } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCustomers, useDeleteCustomer, type CustomerDto } from '../hooks/use-customers';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';

const cust = t('customer');
const common = t('common');
const msgs = t('messages');

export function CustomerListPage() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch } = useCustomers({
    page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
  });

  const deleteMutation = useDeleteCustomer();

  const filters: FilterPill[] = [
    { key: '', label: common.all, active: activeFilter === '' },
    { key: 'active', label: common.active, active: activeFilter === 'active' },
    { key: 'inactive', label: common.inactive, active: activeFilter === 'inactive' },
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

  const customers = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={cust.title}
        subtitle={cust.subtitle}
        action={{
          label: cust.newCustomer,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/customers/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={cust.searchPlaceholder}
        filters={filters}
        onFilterToggle={(key) => { setActiveFilter(key); setPage(1); }}
      />

      {isLoading && <DataTableSkeleton columns={6} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {customers.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search ? common.noResults : common.noData}
                description={search ? cust.noCustomerFound : cust.noCustomerYet}
                icon={<IconUsersGroup size={20} />}
                action={!search ? (
                  <Button variant="default" size="sm" onClick={() => router.push('/customers/new')}>
                    <IconPlus size={14} /> {cust.newCustomer}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{cust.customerCode}</TableHead>
                  <TableHead>{cust.customerName}</TableHead>
                  <TableHead>{cust.phone}</TableHead>
                  <TableHead>{cust.creditLimit}</TableHead>
                  <TableHead>{common.status}</TableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-fg-secondary ltr-text" dir="ltr">{row.phone1 ?? '—'}</TableCell>
                    <TableCell className="tabular-nums">
                      {row.creditLimit ? formatMoney(row.creditLimit, { showUnit: false }) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.isActive ? 'success' : 'danger'}>
                        {row.isActive ? common.active : common.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="xs"><IconPen size={12} /> {common.edit}</Button>
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

          {customers.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-fg-tertiary">{toPersianDigits(data?.total ?? 0)} {cust.customerCount}</span>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={msgs.deleteConfirm}
        description={deleteTarget ? `${deleteTarget.name} (${deleteTarget.code}) ${msgs.deleteWarning}` : ''}
        confirmLabel={common.delete}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
