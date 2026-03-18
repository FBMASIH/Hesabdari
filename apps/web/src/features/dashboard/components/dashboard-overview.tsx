'use client';

import { useState } from 'react';
import { PageHeader, type DashboardMode, type DateRange } from './page-header';
import { KpiStrip } from './kpi-strip';
import { CashflowChart } from './cashflow-chart';
import { TodayTasks } from './today-tasks';
import { ActivityTable } from './activity-table';
import { MoneySummary } from './money-summary';
import { ManagementView } from './management-view';
import { AccountingView } from './accounting-view';

export function DashboardOverview() {
  const [activeMode, setActiveMode] = useState<DashboardMode>('daily');
  const [dateRange, setDateRange] = useState<DateRange>('thisWeek');

  return (
    <div className="flex flex-col">
      {/* 1. Page title + mode controls */}
      <PageHeader
        activeMode={activeMode}
        onModeChange={setActiveMode}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* 2. Mode-specific content */}
      {activeMode === 'daily' && (
        <>
          <KpiStrip />
          <div className="flex flex-col gap-4 pb-4 lg:flex-row">
            <CashflowChart />
            <TodayTasks />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            <ActivityTable />
            <MoneySummary />
          </div>
        </>
      )}

      {activeMode === 'management' && <ManagementView />}
      {activeMode === 'accounting' && <AccountingView />}
    </div>
  );
}
