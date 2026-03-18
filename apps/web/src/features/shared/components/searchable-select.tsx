'use client';

import { useState, useMemo } from 'react';
import { Input, Spinner, cn } from '@hesabdari/ui';

export interface SearchableSelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface SearchableSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: SearchableSelectOption[];
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * A simple searchable dropdown for entity selection.
 * Shows a text input that filters options. Selected value displays the label.
 * Returns the `id` (UUID) on selection.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  isLoading = false,
  placeholder = 'جستجو...',
  className,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) => o.label.includes(q) || (o.sublabel?.includes(q) ?? false),
    );
  }, [options, query]);

  function handleSelect(id: string) {
    onChange(id);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        value={open ? query : selectedOption?.label ?? ''}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay to allow click on option
          setTimeout(() => setOpen(false), 200);
        }}
        placeholder={placeholder}
        className="h-8 rounded-lg text-xs"
      />
      {isLoading && (
        <div className="absolute end-2 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}
      {open && (
        <div className="absolute z-modal mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border-primary bg-bg-primary shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-fg-tertiary">نتیجه‌ای یافت نشد</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt.id)}
                className={cn('flex w-full items-center gap-2 px-3 py-2 text-start text-xs transition-colors hover:bg-bg-secondary',
                  value === opt.id ? 'bg-primary-subtle text-primary-default' : 'text-fg-primary'
                )}
              >
                {opt.sublabel && (
                  <span className="text-fg-tertiary">{opt.sublabel}</span>
                )}
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
