'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  EmptyState,
  ConfirmDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  SortableTableHead,
  TableCell,
  IconPlus,
  IconUsersGroup,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import {
  DataPageHeader,
  DataFilterBar,
  DataTableSkeleton,
  DataErrorState,
  TableRowActions,
  ActiveBadge,
  TablePaginationFooter,
  type FilterPill,
} from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCustomers, useDeleteCustomer, type CustomerDto } from '../hooks/use-customers';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';
import type { SortState } from '@hesabdari/ui';

const cust = t('customer');
const common = t('common');
const msgs = t('messages');

interface CustomerListPageProps {
  initialData?: PaginatedResponse<CustomerDto>;
}

export function CustomerListPage({ initialData }: CustomerListPageProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);
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
  const isDefaultQuery = page === 1 && !debouncedSearch && !activeFilter && !sort;

  const { data, isLoading, isError, error, refetch } = useCustomers(
    {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
      sortBy: sort?.key,
      sortOrder: sort?.direction,
    },
    isDefaultQuery ? initialData : undefined,
  );

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
        showToast({
          title: err instanceof ApiError ? err.message : msgs.unexpectedError,
          variant: 'error',
        });
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
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={cust.searchPlaceholder}
        filters={filters}
        onFilterToggle={(key) => {
          setActiveFilter(key);
          setPage(1);
        }}
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
                action={
                  !search ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push('/customers/new')}
                    >
                      <IconPlus size={14} /> {cust.newCustomer}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="code" sort={sort} onSort={toggleSort}>
                    {cust.customerCode}
                  </SortableTableHead>
                  <SortableTableHead sortKey="name" sort={sort} onSort={toggleSort}>
                    {cust.customerName}
                  </SortableTableHead>
                  <SortableTableHead sortKey="phone1" sort={sort} onSort={toggleSort}>
                    {cust.phone}
                  </SortableTableHead>
                  <SortableTableHead sortKey="creditLimit" sort={sort} onSort={toggleSort}>
                    {cust.creditLimit}
                  </SortableTableHead>
                  <SortableTableHead sortKey="isActive" sort={sort} onSort={toggleSort}>
                    {common.status}
                  </SortableTableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-fg-secondary ltr-text">
                      {row.phone1 ?? '—'}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.creditLimit && row.creditLimit !== '0'
                        ? formatMoney(row.creditLimit, { showUnit: false })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={row.isActive} />
                    </TableCell>
                    <TableCell>
                      <TableRowActions
                        onEdit={() => router.push(`/customers/${row.id}/edit`)}
                        onDelete={() => setDeleteTarget(row)}
                        deleteDisabled={deleteMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {customers.length > 0 && (
            <TablePaginationFooter
              total={data?.total ?? 0}
              unitLabel={cust.customerCount}
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
          deleteTarget ? `${deleteTarget.name} (${deleteTarget.code}) ${msgs.deleteWarning}` : ''
        }
        confirmLabel={common.delete}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
