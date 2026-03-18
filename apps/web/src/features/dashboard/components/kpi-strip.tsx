import { Skeleton } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');

const kpiLabels = [dash.dailySales, dash.posTerminal, dash.todaysCheques, dash.cashSales];

function KpiCardSkeleton({ label }: { label: string }) {
  return (
    <div className="glass-surface-static flex flex-1 flex-col gap-2 rounded-2xl px-5 py-4">
      <span className="text-xs font-medium text-fg-tertiary">{label}</span>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function KpiStrip() {
  return (
    <div className="flex gap-4 pb-4">
      {kpiLabels.map((label) => (
        <KpiCardSkeleton key={label} label={label} />
      ))}
    </div>
  );
}
