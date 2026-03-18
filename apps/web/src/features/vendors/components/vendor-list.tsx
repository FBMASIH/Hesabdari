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
import { toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataFilterBar, DataTableSkeleton, DataErrorState, type FilterPill } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useVendors, useDeleteVendor, type VendorDto } from '../hooks/use-vendors';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ApiError } from '@hesabdari/api-client';

const vnd = t('vendor');
const common = t('common');
const msgs = t('messages');

export function VendorListPage() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<VendorDto | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch } = useVendors({
    page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
  });

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
        showToast({ title: err instanceof ApiError ? err.message : msgs.unexpectedError, variant: 'error' });
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
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="جستجو نام یا کد تأمین‌کننده..."
        filters={filters}
        onFilterToggle={(key) => { setActiveFilter(key); setPage(1); }}
      />

      {isLoading && <DataTableSkeleton columns={5} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {vendors.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search ? common.noResults : common.noData}
                description={search ? 'تأمین‌کننده‌ای با این مشخصات یافت نشد' : 'هنوز تأمین‌کننده‌ای ثبت نشده است'}
                icon={<IconDelivery size={20} />}
                action={!search ? (
                  <Button variant="default" size="sm" onClick={() => router.push('/vendors/new')}>
                    <IconPlus size={14} /> {vnd.newVendor}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{vnd.vendorCode}</TableHead>
                  <TableHead>{vnd.vendorName}</TableHead>
                  <TableHead>{common.status}</TableHead>
                  <TableHead>{common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium ltr-text" dir="ltr">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
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

          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-fg-tertiary">{toPersianDigits(data?.total ?? 0)} تأمین‌کننده</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
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
