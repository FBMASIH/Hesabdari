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
  IconDelivery,
  IconPen,
  IconTrash,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataFilterBar, DataTableSkeleton, DataErrorState, type FilterPill } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useProductsList, useDeleteProduct, type ProductDetailDto } from '../hooks/use-products-crud';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';

const prod = t('product');
const common = t('common');
const msgs = t('messages');

export function ProductListPage() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ProductDetailDto | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch } = useProductsList({
    page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
  });

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
        showToast({ title: err instanceof ApiError ? err.message : msgs.unexpectedError, variant: 'error' });
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
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={prod.searchPlaceholder}
        filters={filters}
        onFilterToggle={(key) => { setActiveFilter(key); setPage(1); }}
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
                action={!search ? (
                  <Button variant="default" size="sm" onClick={() => router.push('/products/new')}>
                    <IconPlus size={14} /> {prod.newProduct}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{prod.productCode}</TableHead>
                  <TableHead>{prod.productName}</TableHead>
                  <TableHead>{prod.countingUnit}</TableHead>
                  <TableHead>{prod.salePrice1}</TableHead>
                  <TableHead>{common.status}</TableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-fg-secondary">{row.countingUnit}</TableCell>
                    <TableCell className="tabular-nums">
                      {row.salePrice1 && row.salePrice1 !== '0' ? formatMoney(row.salePrice1, { showUnit: false }) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.isActive ? 'success' : 'danger'}>
                        {row.isActive ? common.active : common.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="xs" onClick={() => router.push(`/products/${row.id}/edit` as never)}><IconPen size={12} /> {common.edit}</Button>
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

          {products.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-fg-tertiary">{toPersianDigits(data?.total ?? 0)} {prod.productCount}</span>
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
