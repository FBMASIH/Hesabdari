'use client';

import { forwardRef, useCallback, useRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface MoneyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /** Value as a plain digit string (e.g. "1250000"). Source of truth. */
  value: string;
  /** Called with the new plain digit string on every change. */
  onChange: (value: string) => void;
  /** Optional suffix label displayed inside the input (e.g. "تومان", "﷼"). */
  suffix?: string;
}

/** Format a digit string with Persian thousand separators (٬). */
function formatWithSeparators(digits: string): string {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
}

/** Strip everything that isn't an ASCII digit. */
function stripNonDigits(str: string): string {
  return str.replace(/[^\d]/g, '');
}

/**
 * Money input — formats with Persian thousand separators as the user types.
 *
 * Accepts and emits a plain digit string (no separators, no decimals).
 * The caller decides the unit semantics (Rial vs Toman).
 *
 * Styling matches the project's macOS-style Input component.
 */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, suffix, disabled, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLInputElement>(null);

    // Use the forwarded ref if provided, otherwise fall back to innerRef.
    const getInputEl = useCallback((): HTMLInputElement | null => {
      if (forwardedRef && typeof forwardedRef === 'object') {
        return forwardedRef.current;
      }
      return innerRef.current;
    }, [forwardedRef]);

    const displayValue = formatWithSeparators(value || '');

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const cursorPos = e.target.selectionStart ?? raw.length;

        // Count digits before the cursor in the raw (pre-format) value.
        let digitsBefore = 0;
        for (let i = 0; i < cursorPos; i++) {
          if (/\d/.test(raw[i]!)) digitsBefore++;
        }

        // Strip to digits and remove leading zeros.
        const digits = stripNonDigits(raw);
        const cleaned = digits.replace(/^0+/, '') || '';

        onChange(cleaned);

        // Restore cursor: find the position in the formatted string where
        // the same number of digits have passed.
        requestAnimationFrame(() => {
          const el = getInputEl();
          if (!el) return;

          const formatted = formatWithSeparators(cleaned);
          let newPos = 0;
          let counted = 0;

          for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i]!)) {
              counted++;
              if (counted === digitsBefore) {
                newPos = i + 1;
                break;
              }
            }
          }
          if (digitsBefore === 0 && cleaned.length === 0) newPos = 0;

          el.setSelectionRange(newPos, newPos);
        });
      },
      [onChange, getInputEl],
    );

    // Merge refs: assign the DOM element to both innerRef and forwardedRef.
    const mergeRef = useCallback(
      (el: HTMLInputElement | null) => {
        (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }
      },
      [forwardedRef],
    );

    return (
      <div className="relative">
        <input
          ref={mergeRef}
          type="text"
          inputMode="numeric"
          dir="ltr"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            'flex h-[30px] w-full rounded-md border-[0.5px] border-border-primary bg-bg-secondary px-2.5 text-[13px] tabular-nums text-fg-primary shadow-inner transition-all',
            'placeholder:text-fg-tertiary',
            'focus:border-brand-deep focus:outline-none focus:ring-[3px] focus:ring-brand-deep/20',
            'disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:opacity-60',
            suffix && 'pe-10',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-2xs text-fg-tertiary">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
MoneyInput.displayName = 'MoneyInput';
