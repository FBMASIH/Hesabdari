import { Skeleton } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');
const msgs = t('messages');

const summaryLabels = [dash.inflow, dash.outflow, dash.balance];

export function MoneySummary() {
  return (
    <div className="glass-surface-static flex w-72 flex-col items-center rounded-2xl p-5">
      <div className="flex w-full items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-fg-primary">{dash.moneySummary}</h2>
      </div>

      {/* Skeleton donut placeholder */}
      <div className="relative mb-5">
        <Skeleton circle className="h-[140px] w-[140px]" />
      </div>

      {/* Summary items — skeleton */}
      <div className="flex w-full flex-col gap-3">
        {summaryLabels.map((label) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-fg-secondary">{label}</span>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-fg-tertiary text-center">{msgs.comingSoon}</p>
    </div>
  );
}
