'use client';

import { useState, useMemo, useCallback, useRef, type KeyboardEvent } from 'react';
import { Input, Spinner, cn } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { DROPDOWN_PANEL } from '@/shared/styles';

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
  placeholder = t('common').searchInputPlaceholder,
  className,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.includes(q) || (o.sublabel?.includes(q) ?? false));
  }, [options, query]);

  function handleSelect(id: string) {
    onChange(id);
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          setOpen(true);
          setActiveIndex(0);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter': {
          e.preventDefault();
          const selected = filtered[activeIndex];
          if (activeIndex >= 0 && selected) {
            handleSelect(selected.id);
          }
          break;
        }
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [open, filtered, activeIndex],
  );

  return (
    <div className={cn('relative', className)}>
      <Input
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        value={open ? query : (selectedOption?.label ?? '')}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay to allow click on option
          setTimeout(() => {
            setOpen(false);
            setActiveIndex(-1);
          }, 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 rounded-lg text-xs"
      />
      {isLoading && (
        <div className="absolute end-2 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}
      {open && (
        <div
          ref={listRef}
          role="listbox"
          className={cn('absolute z-dropdown mt-1.5 max-h-48 w-full overflow-auto', DROPDOWN_PANEL)}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-fg-tertiary">{t('common').noResults}</div>
          ) : (
            filtered.map((opt, index) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={value === opt.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-bg-tertiary/50',
                  value === opt.id
                    ? 'bg-primary-subtle text-primary-default font-medium'
                    : 'text-fg-primary',
                  index === activeIndex && 'bg-bg-tertiary/50',
                )}
              >
                {opt.sublabel && <span className="text-fg-tertiary">{opt.sublabel}</span>}
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
