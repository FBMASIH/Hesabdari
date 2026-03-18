'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { IconCalendar } from '../icons';

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  /** Current value in display format (e.g. '۱۴۰۵/۰۱/۱۵'). */
  value: string;
  /** Called with the raw input string on change. */
  onChange: (value: string) => void;
  /** Error state. */
  hasError?: boolean;
}

/**
 * A text input optimized for Jalali date entry.
 * Displays a calendar icon and accepts Persian-formatted dates.
 * Conversion logic lives in the consumer (date.ts utilities).
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, hasError, placeholder = '۱۴۰۵/۰۱/۰۱', ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex h-[30px] w-full rounded-md border-[0.5px] bg-bg-secondary pe-3 ps-9 text-center text-[13px] tabular-nums text-fg-primary shadow-inner transition-all',
            'placeholder:text-fg-tertiary',
            'focus:border-brand-deep focus:outline-none focus:ring-[3px] focus:ring-brand-deep/20',
            'disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:opacity-60',
            hasError ? 'border-danger-default' : 'border-border-primary',
            className,
          )}
          {...props}
        />
        <IconCalendar size={16} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none" />
      </div>
    );
  },
);
DateInput.displayName = 'DateInput';
