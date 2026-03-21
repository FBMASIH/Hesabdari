'use client';

import { useId } from 'react';
import { useCurrencies } from '../hooks/use-currencies';

interface CurrencySelectProps {
  value: string;
  onChange: (id: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function CurrencySelect({
  value,
  onChange,
  label,
  disabled,
  className,
  error,
}: CurrencySelectProps) {
  const selectId = useId();
  const { data: currencies, isLoading } = useCurrencies();

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-fg-secondary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        aria-label={label ?? 'انتخاب ارز'}
        aria-invalid={error ? 'true' : undefined}
        className="w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-fg-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus disabled:opacity-50"
      >
        <option value="">انتخاب ارز...</option>
        {currencies?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} — {c.name} ({c.symbol})
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-fg-danger">{error}</p>}
    </div>
  );
}
