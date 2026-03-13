import { Card, CardHeader, CardTitle, CardContent } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const d = t('dashboard');

const summaryCards = [
  { title: d.totalRevenue, value: '--', description: d.currentPeriodLabel },
  { title: d.totalExpenses, value: '--', description: d.currentPeriodLabel },
  { title: d.netIncome, value: '--', description: d.currentPeriodLabel },
  { title: d.openInvoices, value: '--', description: d.awaitingPayment },
] as const;

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg-primary">{d.title}</h1>
        <p className="mt-1 text-fg-secondary">{d.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-fg-secondary">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums text-fg-primary">{card.value}</div>
              <p className="text-xs text-fg-tertiary">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
