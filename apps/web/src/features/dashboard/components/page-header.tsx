'use client';

import { useState } from 'react';
import { cn, IconCalendar } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');
const common = t('common');

const modes = [
  { key: 'daily', label: dash.daily },
  { key: 'management', label: dash.management },
  { key: 'accounting', label: dash.accountingMode },
] as const;

export function PageHeader() {
  const [activeMode, setActiveMode] = useState<string>('daily');

  return (
    <div className="flex items-start justify-between pt-6 pb-4">
      {/* Title — right side in RTL */}
      <div>
        <h1 className="text-xl font-semibold text-fg-primary">{dash.title}</h1>
        <p className="mt-0.5 text-sm text-fg-tertiary">{dash.subtitle}</p>
      </div>

      {/* Mode controls + date range — left side in RTL */}
      <div className="flex items-center gap-3">
        <div className="glass-surface-static inline-flex items-center gap-0.5 rounded-xl p-1">
          {modes.map((mode) => (
            <button
              type="button"
              key={mode.key}
              onClick={() => setActiveMode(mode.key)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                activeMode === mode.key
                  ? 'bg-bg-secondary text-fg-primary shadow-xs'
                  : 'text-fg-tertiary hover:text-fg-secondary',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <button type="button" className="glass-surface-static flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-fg-secondary hover:text-fg-primary transition-colors">
          <IconCalendar size={14} />
          {common.thisWeek}
        </button>
      </div>
    </div>
  );
}
