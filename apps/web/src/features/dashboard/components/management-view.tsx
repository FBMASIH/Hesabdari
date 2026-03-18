import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  EmptyState,
  IconChart,
  IconTrendingUp,
  IconUsersGroup,
  IconDelivery,
  IconDocument,
  IconWallet,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';

const dash = t('dashboard');
const common = t('common');

/* ── Quick-stat cards ────────────────────────── */

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  href: string;
  color: string;
}

const stats: StatCard[] = [
  {
    label: dash.totalRevenue,
    value: formatMoney('0', { showUnit: false }),
    sub: dash.comparedToYesterday,
    icon: <IconTrendingUp size={18} />,
    href: '/reports',
    color: 'bg-success-default/12 text-success-default',
  },
  {
    label: dash.totalExpenses,
    value: formatMoney('0', { showUnit: false }),
    sub: dash.comparedToYesterday,
    icon: <IconWallet size={18} />,
    href: '/reports',
    color: 'bg-danger-default/12 text-danger-default',
  },
  {
    label: dash.openInvoices,
    value: toPersianDigits(0),
    sub: dash.awaitingPayment,
    icon: <IconDocument size={18} />,
    href: '/invoices',
    color: 'bg-warning-default/12 text-warning-default',
  },
];

/* ── Entity summary links ────────────────────── */

interface EntityLink {
  label: string;
  count: string;
  icon: ReactNode;
  href: string;
}

const entities: EntityLink[] = [
  { label: t('customer').title, count: toPersianDigits(0), icon: <IconUsersGroup size={18} />, href: '/customers' },
  { label: t('vendor').title, count: toPersianDigits(0), icon: <IconDelivery size={18} />, href: '/vendors' },
  { label: t('invoice').title, count: toPersianDigits(0), icon: <IconDocument size={18} />, href: '/invoices' },
];

export function ManagementView() {
  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href as '/reports' | '/invoices'}
            className="glass-surface flex flex-col gap-3 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-fg-tertiary">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <span className="text-2xl font-bold tabular-nums text-fg-primary">
              {stat.value}
              <span className="ms-1 text-xs font-normal text-fg-tertiary">{common.toman}</span>
            </span>
            <span className="text-[11px] text-fg-tertiary">{stat.sub}</span>
          </Link>
        ))}
      </div>

      {/* Lower row — chart + entity quick links */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Chart placeholder */}
        <div className="glass-surface-static flex flex-1 flex-col rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-fg-primary">{dash.moneyTrend}</h2>
            <p className="mt-0.5 text-xs text-fg-tertiary">{dash.moneyTrendSubtitle}</p>
          </div>
          <EmptyState
            title={common.noData}
            description={dash.chartEmptyDescription}
            icon={<IconChart size={20} />}
          />
        </div>

        {/* Entity quick links */}
        <div className="glass-surface-static flex w-72 flex-col gap-2 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-fg-primary mb-2">{common.viewAll}</h2>
          {entities.map((entity) => (
            <Link
              key={entity.label}
              href={entity.href as '/customers' | '/vendors' | '/invoices'}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-bg-primary/60"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-brand-deep">
                  {entity.icon}
                </div>
                <span className="text-sm font-medium text-fg-primary">{entity.label}</span>
              </div>
              <span className="tabular-nums text-xs text-fg-tertiary">{entity.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
