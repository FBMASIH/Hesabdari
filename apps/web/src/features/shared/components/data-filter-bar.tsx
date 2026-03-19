'use client';

import { type ReactNode } from 'react';
import { cn, IconMagnifer } from '@hesabdari/ui';

export interface FilterPill {
  key: string;
  label: string;
  active: boolean;
}

export interface DataFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Filter pills rendered after the search input. */
  filters?: FilterPill[];
  onFilterToggle?: (key: string) => void;
  /** Extra controls (e.g. date range, export button). */
  trailing?: ReactNode;
}

export function DataFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterToggle,
  trailing,
}: DataFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-4">
      {/* Search */}
      <div className="flex h-9 flex-1 min-w-[200px] max-w-sm items-center gap-2 rounded-xl border border-border-primary bg-bg-primary/60 px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-brand-deep focus-within:ring-[3px] focus-within:ring-brand-deep/15">
        <IconMagnifer size={16} className="flex-shrink-0 text-fg-tertiary" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="flex-1 bg-transparent text-sm text-fg-primary placeholder:text-fg-tertiary focus:outline-none"
        />
      </div>

      {/* Filter pills */}
      {filters?.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onFilterToggle?.(f.key)}
          className={cn(
            'flex h-9 items-center rounded-xl border px-3 text-xs font-medium transition-all duration-200',
            f.active
              ? 'border-primary-default/30 bg-primary-subtle text-primary-default'
              : 'border-border-primary text-fg-secondary hover:text-fg-primary',
          )}
        >
          {f.label}
        </button>
      ))}

      {/* Trailing controls */}
      {trailing && <div className="ms-auto flex items-center gap-2">{trailing}</div>}
    </div>
  );
}
