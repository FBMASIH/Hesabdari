'use client';

import { type ReactNode } from 'react';
import { IconCart, IconWallet, IconDocument, IconScale } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';

const dash = t('dashboard');

interface KpiItem {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  color: string;
}

const kpiItems: KpiItem[] = [
  {
    label: dash.dailySales,
    value: formatMoney('0', { showUnit: false }),
    sub: `${toPersianDigits(0)} ${dash.transactions}`,
    icon: <IconCart size={18} />,
    color: 'bg-success-default/12 text-success-default',
  },
  {
    label: dash.posTerminal,
    value: formatMoney('0', { showUnit: false }),
    sub: `${toPersianDigits(0)} ${dash.transactions}`,
    icon: <IconWallet size={18} />,
    color: 'bg-primary-default/12 text-primary-default',
  },
  {
    label: dash.todaysCheques,
    value: `${toPersianDigits(0)} ${dash.items}`,
    sub: `${toPersianDigits(0)} ${dash.dueSoon}`,
    icon: <IconDocument size={18} />,
    color: 'bg-warning-default/12 text-warning-default',
  },
  {
    label: dash.cashSales,
    value: formatMoney('0', { showUnit: false }),
    sub: `${toPersianDigits(0)} ${dash.transactions}`,
    icon: <IconScale size={18} />,
    color: 'bg-info-default/12 text-info-default',
  },
];

export function KpiStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpiItems.map((item) => (
        <div
          key={item.label}
          className="glass-interactive flex flex-col gap-2 rounded-2xl p-4 cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-fg-tertiary">{item.label}</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.color}`}>
              {item.icon}
            </div>
          </div>
          <span className="text-xl font-bold tabular-nums text-fg-primary leading-tight">
            {item.value}
          </span>
          <span className="text-2xs text-fg-tertiary">{item.sub}</span>
        </div>
      ))}
    </div>
  );
}
