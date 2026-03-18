'use client';

import { useState, useMemo } from 'react';
import { Badge, EmptyState, cn, IconChevronRight, IconBuildings } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { toPersianDigits } from '@/shared/lib/date';
import { DataPageHeader, DataErrorState, DataTableSkeleton } from '@/features/shared';
import { useAccounts, type AccountDto } from '@/features/shared/hooks/use-accounts';

const acct = t('accounting');
const common = t('common');

const typeLabel: Record<AccountDto['type'], string> = {
  ASSET: acct.types.asset,
  LIABILITY: acct.types.liability,
  EQUITY: acct.types.equity,
  REVENUE: acct.types.revenue,
  EXPENSE: acct.types.expense,
};

const typeColor: Record<AccountDto['type'], 'default' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  ASSET: 'success',
  LIABILITY: 'danger',
  EQUITY: 'warning',
  REVENUE: 'success',
  EXPENSE: 'danger',
};

// ── Tree node ───────────────────────────────────────

interface TreeNodeProps {
  account: AccountDto;
  children: AccountDto[];
  childrenMap: Map<string, AccountDto[]>;
  depth: number;
}

function AccountTreeNode({ account, children, childrenMap, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = children.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-3 border-b border-border-secondary/50 py-3.5 pe-5 transition-colors hover:bg-bg-primary/40',
          hasChildren ? 'cursor-pointer' : 'cursor-default',
        )}
        style={{ paddingInlineStart: `${depth * 28 + 20}px` }}
      >
        {/* Expand/collapse indicator */}
        <span className="flex h-5 w-5 items-center justify-center text-fg-tertiary">
          {hasChildren ? (
            <IconChevronRight size={14} className={cn('transition-transform', expanded && 'rotate-90')} />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-fg-tertiary/40" />
          )}
        </span>

        {/* Code */}
        <span className="w-24 text-start text-sm tabular-nums text-fg-secondary ltr-text" dir="ltr">
          {toPersianDigits(account.code)}
        </span>

        {/* Name */}
        <span className={cn('flex-1 text-start text-sm', hasChildren ? 'font-medium text-fg-primary' : 'text-fg-primary')}>
          {account.name}
        </span>

        {/* Type badge */}
        <Badge variant={typeColor[account.type]}>
          {typeLabel[account.type]}
        </Badge>

        {/* Active status */}
        {!account.isActive && (
          <Badge variant="danger">{common.inactive}</Badge>
        )}
      </button>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <AccountTreeNode
              key={child.id}
              account={child}
              children={childrenMap.get(child.id) ?? []}
              childrenMap={childrenMap}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page component ──────────────────────────────────

export function AccountTreePage() {
  const { data: accounts, isLoading, isError, error, refetch } = useAccounts();

  // Build tree from flat list — O(n) map lookup instead of O(n²) filtering
  const accountTree = useMemo(() => {
    if (!accounts) return { rootAccounts: [] as AccountDto[], childrenMap: new Map<string, AccountDto[]>() };
    const roots: AccountDto[] = [];
    const map = new Map<string, AccountDto[]>();
    for (const account of accounts) {
      if (!account.parentId) {
        roots.push(account);
      } else {
        const siblings = map.get(account.parentId) ?? [];
        siblings.push(account);
        map.set(account.parentId, siblings);
      }
    }
    return { rootAccounts: roots, childrenMap: map };
  }, [accounts]);
  const { rootAccounts, childrenMap } = accountTree;

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={acct.chartOfAccounts}
        subtitle={acct.chartOfAccountsDesc}
      />

      {isLoading && <DataTableSkeleton columns={3} rows={8} />}

      {isError && <DataErrorState error={error} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="glass-surface-static overflow-hidden rounded-2xl">
          {rootAccounts.length === 0 ? (
            <EmptyState
              title={common.noData}
              description={acct.noAccountYet}
              icon={<IconBuildings size={20} />}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border-secondary py-3 pe-5 ps-5">
                <span className="w-5" />
                <span className="w-24 text-xs font-medium text-fg-tertiary">{acct.accountCode}</span>
                <span className="flex-1 text-xs font-medium text-fg-tertiary">{acct.accountName}</span>
                <span className="text-xs font-medium text-fg-tertiary">{acct.accountType}</span>
              </div>

              {/* Tree */}
              {rootAccounts.map((root) => (
                <AccountTreeNode
                  key={root.id}
                  account={root}
                  children={childrenMap.get(root.id) ?? []}
                  childrenMap={childrenMap}
                  depth={0}
                />
              ))}

              {/* Summary */}
              <div className="border-t border-border-secondary px-5 py-3">
                <span className="text-xs text-fg-tertiary">
                  {toPersianDigits(accounts?.length ?? 0)} {acct.accountUnit}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
