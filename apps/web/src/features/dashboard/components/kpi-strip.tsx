'use client';

import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';

const dash = t('dashboard');

interface KpiItem {
  label: string;
  value: string;
  sub: string;
}

const kpiItems: KpiItem[] = [
  {
    label: dash.dailySales,
    value: formatMoney('0', { showUnit: false }),
    sub: `${toPersianDigits(0)} ${dash.transactions}`,
  },
  {
    label: dash.posTerminal,
    value: formatMoney('0', { showUnit: false }),
    sub: `${toPersianDigits(0)} ${dash.transactions}`,
  },
  {
    label: dash.todaysCheques,
    value: `${toPersianDigits(0)} ${dash.items}`,
    sub: `${toPersianDigits(0)} ${dash.dueSoon}`,
  },
  {
    label: dash.cashSales,
    value: formatMoney('0', { showUnit: false }),
    sub: `${toPersianDigits(0)} ${dash.transactions}`,
  },
];

export function KpiStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 pb-3 lg:grid-cols-4">
      {kpiItems.map((item) => (
        <div
          key={item.label}
          className="glass-interactive flex flex-col gap-1 rounded-2xl px-4 py-3.5 cursor-default"
        >
          <span className="text-[11px] font-medium text-fg-tertiary">{item.label}</span>
          <span className="text-xl font-bold tabular-nums text-fg-primary leading-tight">
            {item.value}
          </span>
          <span className="text-[11px] text-fg-tertiary">{item.sub}</span>
        </div>
      ))}
    </div>
  );
}
