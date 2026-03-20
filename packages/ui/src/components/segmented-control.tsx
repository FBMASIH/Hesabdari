'use client';

import { type ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface SegmentedControlItem<T extends string = string> {
  key: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible label for the control group (required for screen readers) */
  label: string;
  /** Size preset — md for nav/tabs, sm for inline controls */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable segmented control — Apple-style pill selector.
 *
 * Uses role="group" + aria-pressed (not tablist/tab) because this is
 * a selection control, not a tabbed panel. This avoids the complex
 * keyboard contract of tablist (arrow-key focus management).
 */
export function SegmentedControl<T extends string = string>({
  items,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'glass-surface-static inline-flex items-center gap-1 rounded-2xl p-1',
        size === 'sm' && 'gap-0.5 rounded-xl p-0.5',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item.key)}
            className={cn(
              'flex items-center gap-2 font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/50',
              size === 'md' && 'rounded-xl px-3.5 py-1.5 text-[13px]',
              size === 'sm' && 'rounded-lg px-3 py-1 text-xs',
              isActive
                ? 'bg-bg-secondary text-fg-primary shadow-sm'
                : 'text-fg-tertiary hover:text-fg-secondary hover:bg-bg-secondary/30',
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  'transition-colors',
                  isActive ? 'text-brand-deep' : 'text-fg-tertiary',
                )}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
