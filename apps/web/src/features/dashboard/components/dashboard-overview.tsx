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
    <div className="flex flex-col gap-5 animate-stagger">
      {/* 1. Page title + mode controls */}
      <PageHeader
        activeMode={activeMode}
        onModeChange={setActiveMode}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* 2. Mode-specific content */}
      {activeMode === 'daily' && (
        <div className="flex flex-col gap-5">
          <KpiStrip />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <CashflowChart />
            </div>
            <div className="lg:col-span-2">
              <TodayTasks />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ActivityTable />
            </div>
            <div className="lg:col-span-2">
              <MoneySummary />
            </div>
          </div>
        </div>
      )}

      {activeMode === 'management' && <ManagementView />}
      {activeMode === 'accounting' && <AccountingView />}
    </div>
  );
}
