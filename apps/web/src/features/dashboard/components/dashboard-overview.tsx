import { Card, CardHeader, CardTitle, CardContent } from '@hesabdari/ui';

const summaryCards = [
  { title: 'Total Revenue', value: '--', description: 'Current period' },
  { title: 'Total Expenses', value: '--', description: 'Current period' },
  { title: 'Net Income', value: '--', description: 'Current period' },
  { title: 'Open Invoices', value: '--', description: 'Awaiting payment' },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg-primary">Dashboard</h1>
        <p className="mt-1 text-fg-secondary">Financial overview for your organization.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-fg-secondary">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fg-primary">{card.value}</div>
              <p className="text-xs text-fg-tertiary">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
