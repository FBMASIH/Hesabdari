'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Pagination,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  IconPlus,
  IconBook,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { formatISOToJalali, toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataFilterBar, DataTableSkeleton, DataErrorState, type FilterPill } from '@/features/shared';
import { useJournalEntries, type JournalEntryDto } from '../hooks/use-journal-entries';
import { useDebounce } from '@/shared/hooks/use-debounce';

// ── i18n lookups ────────────────────────────────────

const j = t('journal');
const acct = t('accounting');
const common = t('common');

type JournalEntryStatus = JournalEntryDto['status'];

const statusLabel: Record<JournalEntryStatus, string> = {
  DRAFT: j.draft,
  POSTED: j.posted,
  REVERSED: j.reversed,
};

const statusVariant: Record<JournalEntryStatus, 'warning' | 'success' | 'danger'> = {
  DRAFT: 'warning',
  POSTED: 'success',
  REVERSED: 'danger',
};

// ── Component ───────────────────────────────────────

export function JournalEntryListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch } = useJournalEntries({
    page,
    pageSize: 10,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const filters: FilterPill[] = [
    { key: '', label: common.all, active: statusFilter === '' },
    { key: 'DRAFT', label: j.draft, active: statusFilter === 'DRAFT' },
    { key: 'POSTED', label: j.posted, active: statusFilter === 'POSTED' },
    { key: 'REVERSED', label: j.reversed, active: statusFilter === 'REVERSED' },
  ];

  function handleFilterToggle(key: string) {
    setStatusFilter(key);
    setPage(1);
  }

  const entries = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  /** Sum debit/credit from journal lines. */
  function entryTotals(entry: JournalEntryDto) {
    let totalDebit = 0n;
    let totalCredit = 0n;
    for (const line of entry.lines) {
      totalDebit += BigInt(line.debitAmount || '0');
      totalCredit += BigInt(line.creditAmount || '0');
    }
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  }

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={j.title}
        subtitle={j.subtitle}
        action={{
          label: j.newEntry,
          icon: <IconPlus size={16} />,
          onClick: () => router.push('/journal-entries/new'),
        }}
      />
      <DataFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={j.searchPlaceholder}
        filters={filters}
        onFilterToggle={handleFilterToggle}
      />

      {isLoading && <DataTableSkeleton columns={7} rows={5} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {entries.length === 0 ? (
            <div className="glass-surface-static overflow-hidden rounded-2xl">
              <EmptyState
                title={search || statusFilter ? common.noResults : common.noData}
                description={search ? j.noEntryFound : j.noEntryYet}
                icon={<IconBook size={20} />}
                action={!search && !statusFilter ? (
                  <Button variant="default" size="sm" onClick={() => router.push('/journal-entries/new')}>
                    <IconPlus size={14} /> {j.newEntry}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{j.entryNumber}</TableHead>
                  <TableHead>{j.entryDate}</TableHead>
                  <TableHead>{common.description}</TableHead>
                  <TableHead>{common.status}</TableHead>
                  <TableHead>{acct.debit}</TableHead>
                  <TableHead>{acct.credit}</TableHead>
                  <TableHead>{j.balanceColumn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const totals = entryTotals(entry);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {toPersianDigits(entry.entryNumber)}
                      </TableCell>
                      <TableCell className="tabular-nums text-fg-secondary">
                        {formatISOToJalali(entry.date, 'short')}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="line-clamp-1">{entry.description}</span>
                        <span className="text-xs text-fg-tertiary">
                          {toPersianDigits(entry.lines.length)} {j.rowCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[entry.status]}>
                          {statusLabel[entry.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatMoney(totals.totalDebit, { unit: 'rial', showUnit: false })}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatMoney(totals.totalCredit, { unit: 'rial', showUnit: false })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={totals.isBalanced ? 'success' : 'danger'}>
                          {totals.isBalanced ? j.balanced : j.unbalanced}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {entries.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-fg-tertiary">
                {toPersianDigits(data?.total ?? 0)} {j.entryCount}
              </span>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
