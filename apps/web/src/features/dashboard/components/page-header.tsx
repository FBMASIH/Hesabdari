'use client';

import { useState, useRef, useCallback } from 'react';
import { cn, IconCalendar, SegmentedControl, type SegmentedControlItem } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { useDismiss } from '@/shared/hooks/use-dismiss';
import { DROPDOWN_PANEL } from '@/shared/styles';

const dash = t('dashboard');
const common = t('common');

export type DashboardMode = 'daily' | 'management' | 'accounting';
export type DateRange = 'today' | 'thisWeek' | 'thisMonth';

const modes = [
  { key: 'daily' as const, label: dash.daily },
  { key: 'management' as const, label: dash.management },
  { key: 'accounting' as const, label: dash.accountingMode },
] satisfies SegmentedControlItem<DashboardMode>[];

const dateRanges: { key: DateRange; label: string }[] = [
  { key: 'today', label: common.today },
  { key: 'thisWeek', label: common.thisWeek },
  { key: 'thisMonth', label: common.thisMonth },
];

interface PageHeaderProps {
  activeMode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function PageHeader({
  activeMode,
  onModeChange,
  dateRange,
  onDateRangeChange,
}: PageHeaderProps) {
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const closeDateMenu = useCallback(() => setDateMenuOpen(false), []);
  useDismiss(dateMenuRef, dateMenuOpen, closeDateMenu);

  const activeDateLabel = dateRanges.find((r) => r.key === dateRange)?.label ?? common.thisWeek;

  return (
    <div className="flex items-start justify-between">
      {/* Title — right side in RTL */}
      <div>
        <h1 className="text-xl font-semibold text-fg-primary">{dash.title}</h1>
        <p className="mt-0.5 text-sm text-fg-tertiary">{dash.subtitle}</p>
      </div>

      {/* Mode controls + date range — left side in RTL */}
      <div className="flex items-center gap-3">
        {/* Mode segmented control */}
        <SegmentedControl
          items={modes}
          value={activeMode}
          onChange={onModeChange}
          label={dash.title}
          size="sm"
        />

        {/* Date range dropdown */}
        <div className="relative" ref={dateMenuRef}>
          <button
            type="button"
            onClick={() => setDateMenuOpen((p) => !p)}
            aria-expanded={dateMenuOpen}
            aria-haspopup="listbox"
            className="glass-surface flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-fg-secondary hover:text-fg-primary"
          >
            <IconCalendar size={14} />
            {activeDateLabel}
          </button>

          {dateMenuOpen && (
            <div
              role="listbox"
              aria-label={common.dateRange}
              className={cn(
                'absolute start-0 top-full z-dropdown mt-1.5 min-w-[140px]',
                DROPDOWN_PANEL,
              )}
            >
              {dateRanges.map((range) => (
                <div
                  role="option"
                  aria-selected={dateRange === range.key}
                  tabIndex={-1}
                  key={range.key}
                  onClick={() => {
                    onDateRangeChange(range.key);
                    setDateMenuOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onDateRangeChange(range.key);
                      setDateMenuOpen(false);
                    }
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-colors',
                    dateRange === range.key
                      ? 'bg-primary-subtle text-fg-primary font-medium'
                      : 'text-fg-secondary hover:bg-bg-tertiary/50 hover:text-fg-primary',
                  )}
                >
                  {range.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
