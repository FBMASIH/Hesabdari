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
import {
  useProductsList,
  useDeleteProduct,
  type ProductDetailDto,
} from '../hooks/use-products-crud';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';
import type { SortState } from '@hesabdari/ui';

const prod = t('product');
const common = t('common');
const msgs = t('messages');

interface ProductListPageProps {
  initialData?: PaginatedResponse<ProductDetailDto>;
}

export function ProductListPage({ initialData }: ProductListPageProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ProductDetailDto | null>(null);
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

  const { data, isLoading, isError, error, refetch } = useProductsList(
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

  const deleteMutation = useDeleteProduct();

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

  const products = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={prod.title}
        subtitle={prod.subtitle}
        action={{
          label: prod.newProduct,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/products/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={prod.searchPlaceholder}
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
          {products.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search ? common.noResults : common.noData}
                description={search ? prod.noProductFound : prod.noProductYet}
                icon={<IconDelivery size={20} />}
                action={
                  !search ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push('/products/new')}
                    >
                      <IconPlus size={14} /> {prod.newProduct}
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
                    {prod.productCode}
                  </SortableTableHead>
                  <SortableTableHead sortKey="name" sort={sort} onSort={toggleSort}>
                    {prod.productName}
                  </SortableTableHead>
                  <SortableTableHead sortKey="countingUnit" sort={sort} onSort={toggleSort}>
                    {prod.countingUnit}
                  </SortableTableHead>
                  <SortableTableHead sortKey="salePrice1" sort={sort} onSort={toggleSort}>
                    {prod.salePrice1}
                  </SortableTableHead>
                  <SortableTableHead sortKey="isActive" sort={sort} onSort={toggleSort}>
                    {common.status}
                  </SortableTableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">
                      {row.code}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-fg-secondary">{row.countingUnit}</TableCell>
                    <TableCell className="tabular-nums">
                      {row.salePrice1 && row.salePrice1 !== '0'
                        ? formatMoney(row.salePrice1, { showUnit: false })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={row.isActive} />
                    </TableCell>
                    <TableCell>
                      <TableRowActions
                        onEdit={() => router.push(`/products/${row.id}/edit`)}
                        onDelete={() => setDeleteTarget(row)}
                        deleteDisabled={deleteMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {products.length > 0 && (
            <TablePaginationFooter
              total={data?.total ?? 0}
              unitLabel={prod.productCount}
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
