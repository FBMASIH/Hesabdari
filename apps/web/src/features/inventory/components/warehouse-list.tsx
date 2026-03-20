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
  TableCell,
  SortableTableHead,
  IconPlus,
  IconBuildings,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
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
import { useWarehouses, useDeleteWarehouse, type WarehouseDto } from '../hooks/use-warehouses';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableSort } from '@/shared/hooks/use-table-sort';
import { ApiError } from '@hesabdari/api-client';

const wh = t('warehouse');
const common = t('common');
const msgs = t('messages');

const COSTING_METHOD_LABELS: Record<WarehouseDto['costingMethod'], string> = {
  FIFO: wh.costingMethods.FIFO,
  LIFO: wh.costingMethods.LIFO,
  AVERAGE: wh.costingMethods.WEIGHTED_AVG,
};

interface WarehouseListPageProps {
  initialData?: PaginatedResponse<WarehouseDto>;
}

export function WarehouseListPage({ initialData }: WarehouseListPageProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseDto | null>(null);

  const debouncedSearch = useDebounce(search);
  const isDefaultQuery = page === 1 && !debouncedSearch && !activeFilter;

  const { data, isLoading, isError, error, refetch } = useWarehouses(
    {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
    },
    isDefaultQuery ? initialData : undefined,
  );

  const deleteMutation = useDeleteWarehouse();

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

  const warehouses = data?.data ?? [];
  const { sort, toggleSort, sorted } = useTableSort(warehouses);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={wh.title}
        subtitle={wh.subtitle}
        action={{
          label: wh.newWarehouse,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/warehouses/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={wh.searchPlaceholder}
        filters={filters}
        onFilterToggle={(key) => {
          setActiveFilter(key);
          setPage(1);
        }}
      />

      {isLoading && <DataTableSkeleton columns={5} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {warehouses.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search ? common.noResults : common.noData}
                description={search ? wh.noWarehouseFound : wh.noWarehouseYet}
                icon={<IconBuildings size={20} />}
                action={
                  !search ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push('/warehouses/new')}
                    >
                      <IconPlus size={14} /> {wh.newWarehouse}
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
                    {wh.warehouseCode}
                  </SortableTableHead>
                  <SortableTableHead sortKey="name" sort={sort} onSort={toggleSort}>
                    {wh.warehouseName}
                  </SortableTableHead>
                  <SortableTableHead sortKey="costingMethod" sort={sort} onSort={toggleSort}>
                    {wh.costingMethod}
                  </SortableTableHead>
                  <SortableTableHead sortKey="isActive" sort={sort} onSort={toggleSort}>
                    {common.status}
                  </SortableTableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">
                      {row.code}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{COSTING_METHOD_LABELS[row.costingMethod]}</TableCell>
                    <TableCell>
                      <ActiveBadge isActive={row.isActive} />
                    </TableCell>
                    <TableCell>
                      <TableRowActions
                        onEdit={() => router.push(`/warehouses/${row.id}/edit` as never)}
                        onDelete={() => setDeleteTarget(row)}
                        deleteDisabled={deleteMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {warehouses.length > 0 && (
            <TablePaginationFooter
              total={data?.total ?? 0}
              unitLabel={wh.warehouseCount}
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
