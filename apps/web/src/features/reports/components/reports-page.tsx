'use client';

import { useState, type ReactNode } from 'react';
import {
  Button,
  DatePicker,
  EmptyState,
  cn,
  IconChart,
  IconScale,
  IconTrendingUp,
  IconClipboardList,
  IconBook,
  IconNotebook,
  IconWallet,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { DataPageHeader, FormSection } from '@/features/shared';

const rpt = t('reports');

const REPORT_TYPES: { key: string; label: string; icon: ReactNode }[] = [
  { key: 'trial-balance', label: rpt.trialBalance, icon: <IconScale size={22} /> },
  { key: 'income-statement', label: rpt.incomeStatement, icon: <IconTrendingUp size={22} /> },
  { key: 'balance-sheet', label: rpt.balanceSheet, icon: <IconClipboardList size={22} /> },
  { key: 'ledger', label: rpt.ledger, icon: <IconBook size={22} /> },
  { key: 'journal', label: rpt.journal, icon: <IconNotebook size={22} /> },
  { key: 'cash-flow', label: rpt.cashFlow, icon: <IconWallet size={22} /> },
];

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  return (
    <div className="flex flex-col animate-stagger">
      <DataPageHeader title={rpt.title} subtitle={rpt.subtitle} />

      {/* Report type selection */}
      <div className="grid grid-cols-2 gap-3 pb-5 sm:grid-cols-3 lg:grid-cols-6">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setSelectedReport(r.key)}
            aria-pressed={selectedReport === r.key}
            className={cn(
              'glass-surface-static flex flex-col items-center gap-2.5 rounded-2xl p-4 text-center transition-all',
              selectedReport === r.key
                ? 'ring-2 ring-brand-deep/50 bg-primary-subtle shadow-md'
                : 'hover:shadow-sm',
            )}
          >
            <span className="text-brand-deep">{r.icon}</span>
            <span className="text-xs font-medium text-fg-primary">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Date range + generate */}
      {selectedReport && (
        <FormSection title={rpt.fiscalPeriod} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="report-from-date"
                className="mb-1 block text-xs font-medium text-fg-secondary"
              >
                {rpt.fromDate}
              </label>
              <DatePicker id="report-from-date" value={fromDate} onChange={setFromDate} />
            </div>
            <div>
              <label
                htmlFor="report-to-date"
                className="mb-1 block text-xs font-medium text-fg-secondary"
              >
                {rpt.toDate}
              </label>
              <DatePicker id="report-to-date" value={toDate} onChange={setToDate} />
            </div>
            <div className="flex items-end">
              <Button type="button" size="sm">
                {rpt.generateReport}
              </Button>
            </div>
          </div>
        </FormSection>
      )}

      {/* Report output placeholder */}
      <div className="glass-surface-static rounded-2xl p-8">
        <EmptyState
          icon={<IconChart size={20} />}
          title={
            selectedReport
              ? (REPORT_TYPES.find((r) => r.key === selectedReport)?.label ?? '')
              : rpt.selectReportType
          }
          description={
            selectedReport ? rpt.reportSelectedDescription : rpt.selectReportTypeDescription
          }
        />
      </div>
    </div>
  );
}
