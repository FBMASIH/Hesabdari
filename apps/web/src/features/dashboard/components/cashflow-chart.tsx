import { EmptyState, IconChart } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');
const msgs = t('messages');

export function CashflowChart() {
  return (
    <div className="glass-surface-static flex flex-1 flex-col rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-fg-primary">{dash.moneyTrend}</h2>
        <p className="mt-0.5 text-xs text-fg-tertiary">{dash.moneyTrendSubtitle}</p>
      </div>
      <EmptyState
        title={msgs.comingSoon}
        description="نمودار جریان ورودی و خروجی پس از اتصال به گزارش‌ها فعال می‌شود"
        icon={<IconChart size={20} />}
      />
    </div>
  );
}
