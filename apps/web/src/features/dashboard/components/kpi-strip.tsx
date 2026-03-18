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
  { label: dash.dailySales, value: formatMoney('0', { showUnit: false }), sub: `${toPersianDigits(0)} ${dash.transactions}` },
  { label: dash.posTerminal, value: formatMoney('0', { showUnit: false }), sub: `${toPersianDigits(0)} ${dash.transactions}` },
  { label: dash.todaysCheques, value: `${toPersianDigits(0)} ${dash.items}`, sub: `${toPersianDigits(0)} ${dash.dueSoon}` },
  { label: dash.cashSales, value: formatMoney('0', { showUnit: false }), sub: `${toPersianDigits(0)} ${dash.transactions}` },
];

export function KpiStrip() {
  return (
    <div className="flex gap-4 pb-4">
      {kpiItems.map((item) => (
        <div key={item.label} className="glass-interactive flex flex-1 flex-col gap-1.5 rounded-2xl px-5 py-4 cursor-default">
          <span className="text-xs font-medium text-fg-tertiary">{item.label}</span>
          <span className="text-lg font-bold tabular-nums text-fg-primary">{item.value}</span>
          <span className="text-[11px] text-fg-tertiary">{item.sub}</span>
        </div>
      ))}
    </div>
  );
}
