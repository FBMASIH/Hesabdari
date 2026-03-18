import { EmptyState, IconChart } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');
const common = t('common');

export function CashflowChart() {
  return (
    <div className="glass-surface-static flex h-full flex-col rounded-2xl p-5">
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
  );
}
