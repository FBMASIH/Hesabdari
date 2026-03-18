import { PageHeader } from './page-header';
import { KpiStrip } from './kpi-strip';
import { CashflowChart } from './cashflow-chart';
import { TodayTasks } from './today-tasks';
import { ActivityTable } from './activity-table';
import { MoneySummary } from './money-summary';

export function DashboardOverview() {
  return (
    <div className="flex flex-col">
      {/* 1. Page title + mode controls */}
      <PageHeader />

      {/* 2. Floating KPI metric strip */}
      <KpiStrip />

      {/* 3. Main content row — chart + action panel */}
      <div className="flex flex-col gap-4 pb-4 lg:flex-row">
        <CashflowChart />
        <TodayTasks />
      </div>

      {/* 4. Lower content row — activity table + money summary */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <ActivityTable />
        <MoneySummary />
      </div>
    </div>
  );
}
