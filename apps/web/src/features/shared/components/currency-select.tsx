'use client';

import { useCurrencies } from '../hooks/use-currencies';

interface CurrencySelectProps {
  value: string;
  onChange: (id: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelect({
  value,
  onChange,
  label,
  disabled,
  className,
}: CurrencySelectProps) {
  const { data: currencies, isLoading } = useCurrencies();

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-fg-secondary">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className="w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-fg-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus disabled:opacity-50"
      >
        <option value="">انتخاب ارز...</option>
        {currencies?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} — {c.name} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
