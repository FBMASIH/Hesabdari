'use client';

import { useState, useRef, useEffect } from 'react';
import { cn, IconCalendar } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');
const common = t('common');

export type DashboardMode = 'daily' | 'management' | 'accounting';
export type DateRange = 'today' | 'thisWeek' | 'thisMonth';

const modes: { key: DashboardMode; label: string }[] = [
  { key: 'daily', label: dash.daily },
  { key: 'management', label: dash.management },
  { key: 'accounting', label: dash.accountingMode },
];

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

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!dateMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) {
        setDateMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDateMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [dateMenuOpen]);

  const activeDateLabel = dateRanges.find((r) => r.key === dateRange)?.label ?? common.thisWeek;

  return (
    <div className="flex items-start justify-between pt-4 pb-3">
      {/* Title — right side in RTL */}
      <div>
        <h1 className="text-xl font-semibold text-fg-primary">{dash.title}</h1>
        <p className="mt-0.5 text-sm text-fg-tertiary">{dash.subtitle}</p>
      </div>

      {/* Mode controls + date range — left side in RTL */}
      <div className="flex items-center gap-3">
        {/* Mode segmented control */}
        <div className="glass-surface-static inline-flex items-center gap-0.5 rounded-xl p-1">
          {modes.map((mode) => (
            <button
              type="button"
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                activeMode === mode.key
                  ? 'bg-bg-secondary text-fg-primary shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)]'
                  : 'text-fg-tertiary hover:text-fg-secondary hover:bg-bg-secondary/30',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

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
              className="absolute start-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border-[0.5px] border-border-primary bg-bg-secondary/95 shadow-lg backdrop-blur-xl"
            >
              {dateRanges.map((range) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={dateRange === range.key}
                  key={range.key}
                  onClick={() => {
                    onDateRangeChange(range.key);
                    setDateMenuOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-xs font-medium transition-colors',
                    dateRange === range.key
                      ? 'bg-primary-subtle text-fg-primary'
                      : 'text-fg-secondary hover:bg-bg-tertiary/50 hover:text-fg-primary',
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
