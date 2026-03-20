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
  IconDelivery,
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
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import { useAppToast } from '@/providers/toast-provider';
import { useVendors, useDeleteVendor, type VendorDto } from '../hooks/use-vendors';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';
import type { SortState } from '@hesabdari/ui';

const vnd = t('vendor');
const common = t('common');
const msgs = t('messages');

interface VendorListPageProps {
  initialData?: PaginatedResponse<VendorDto>;
}

export function VendorListPage({ initialData }: VendorListPageProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<VendorDto | null>(null);
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

  const { data, isLoading, isError, error, refetch } = useVendors(
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

  const deleteMutation = useDeleteVendor();

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

  const vendors = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={vnd.title}
        subtitle={vnd.subtitle}
        action={{
          label: vnd.newVendor,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/vendors/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={vnd.searchPlaceholder}
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
          {vendors.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search ? common.noResults : common.noData}
                description={search ? vnd.noVendorFound : vnd.noVendorYet}
                icon={<IconDelivery size={20} />}
                action={
                  !search ? (
                    <Button variant="default" size="sm" onClick={() => router.push('/vendors/new')}>
                      <IconPlus size={14} /> {vnd.newVendor}
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
                    {vnd.vendorCode}
                  </SortableTableHead>
                  <SortableTableHead sortKey="name" sort={sort} onSort={toggleSort}>
                    {vnd.vendorName}
                  </SortableTableHead>
                  <SortableTableHead sortKey="isActive" sort={sort} onSort={toggleSort}>
                    {common.status}
                  </SortableTableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">
                      {row.code}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <ActiveBadge isActive={row.isActive} />
                    </TableCell>
                    <TableCell>
                      <TableRowActions
                        onEdit={() => router.push(`/vendors/${row.id}/edit`)}
                        onDelete={() => setDeleteTarget(row)}
                        deleteDisabled={deleteMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {vendors.length > 0 && (
            <TablePaginationFooter
              total={data?.total ?? 0}
              unitLabel={vnd.vendorCount}
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
