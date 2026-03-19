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
import { ICON_CIRCLE, LINK_HOVER, GLASS_PANEL } from '@/shared/styles';

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
  {
    label: t('customer').title,
    count: toPersianDigits(0),
    icon: <IconUsersGroup size={18} />,
    href: '/customers',
  },
  {
    label: t('vendor').title,
    count: toPersianDigits(0),
    icon: <IconDelivery size={18} />,
    href: '/vendors',
  },
  {
    label: t('invoice').title,
    count: toPersianDigits(0),
    icon: <IconDocument size={18} />,
    href: '/invoices',
  },
];

export function ManagementView() {
  return (
    <div className="flex flex-col gap-3">
      {/* Stat cards — 3 columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href as never}
            className="glass-interactive flex flex-col gap-2 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-fg-tertiary">{stat.label}</span>
              <div className={`${ICON_CIRCLE} ${stat.color}`}>{stat.icon}</div>
            </div>
            <span className="text-xl font-bold tabular-nums text-fg-primary leading-tight">
              {stat.value}
              <span className="ms-1 text-xs font-normal text-fg-tertiary">{common.toman}</span>
            </span>
            <span className="text-[11px] text-fg-tertiary">{stat.sub}</span>
          </Link>
        ))}
      </div>

      {/* Lower row — 5-col grid (3:2 ratio) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {/* Chart */}
        <div className="lg:col-span-3">
          <div className={GLASS_PANEL}>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-fg-primary">{dash.moneyTrend}</h2>
              <p className="mt-0.5 text-xs text-fg-tertiary">{dash.moneyTrendSubtitle}</p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title={common.noData}
                description={dash.chartEmptyDescription}
                icon={<IconChart size={20} />}
                className="py-6"
              />
            </div>
          </div>
        </div>

        {/* Entity quick links */}
        <div className="lg:col-span-2">
          <div className={`${GLASS_PANEL} gap-2`}>
            <h2 className="mb-1 text-base font-semibold text-fg-primary">{common.viewAll}</h2>
            {entities.map((entity) => (
              <Link
                key={entity.label}
                href={entity.href as never}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${LINK_HOVER}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`${ICON_CIRCLE} bg-primary-subtle text-brand-deep shadow-xs`}>
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
    </div>
  );
}
