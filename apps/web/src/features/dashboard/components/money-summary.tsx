import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';

const dash = t('dashboard');
const common = t('common');

const summaryItems = [
  { label: dash.inflow, value: '0', color: 'bg-success-default' },
  { label: dash.outflow, value: '0', color: 'bg-danger-default' },
  { label: dash.balance, value: '0', color: 'bg-primary-default' },
];

export function MoneySummary() {
  return (
    <div className="glass-surface-static flex flex-col rounded-2xl p-5">
      <h2 className="mb-5 text-base font-semibold text-fg-primary">{dash.moneySummary}</h2>

      <div className="flex flex-col gap-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-fg-secondary">{item.label}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-fg-primary">
              {formatMoney(item.value, { showUnit: false })}
              <span className="ms-1 text-xs font-normal text-fg-tertiary">{common.toman}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
