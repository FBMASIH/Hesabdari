/**
 * Persian money formatting utilities.
 *
 * Rules (from CLAUDE.md):
 * - Storage: BigInt in Rial (IRR), integer-only
 * - Display: Toman (Rial / 10) with Persian numerals and thousand separators
 * - API: money as integer string ("1250000")
 */

import { toPersianDigits } from './date';

/**
 * Format a Rial amount for display as Toman.
 *
 * @param rialAmount - Amount in Rial (bigint or string). Number is not accepted to prevent silent precision loss for large IRR values.
 * @param options - Display options
 * @returns Formatted Persian string, e.g. '۱۲۵٬۰۰۰ تومان'
 */
export function formatMoney(
  rialAmount: bigint | string,
  options: {
    /** Show as Toman (÷10) or Rial. Default: 'toman' */
    unit?: 'toman' | 'rial';
    /** Show unit suffix. Default: true */
    showUnit?: boolean;
    /** Show abbreviated (e.g. ۱.۲ میلیون). Default: false */
    compact?: boolean;
  } = {},
): string {
  const { unit = 'toman', showUnit = true, compact = false } = options;

  let amount = typeof rialAmount === 'bigint' ? rialAmount : BigInt(rialAmount);

  if (unit === 'toman') {
    amount = amount / 10n;
  }

  const isNegative = amount < 0n;
  const abs = isNegative ? -amount : amount;

  if (compact) {
    return formatCompact(abs, isNegative, unit, showUnit);
  }

  const formatted = formatWithSeparators(abs);
  const sign = isNegative ? '−' : '';
  const suffix = showUnit ? (unit === 'toman' ? ' تومان' : ' ﷼') : '';

  return `${sign}${toPersianDigits(formatted)}${suffix}`;
}

/**
 * Format a raw number with Persian thousand separators (٬).
 * Input should be a non-negative value.
 */
function formatWithSeparators(value: bigint): string {
  const str = value.toString();
  const parts: string[] = [];
  for (let i = str.length; i > 0; i -= 3) {
    parts.unshift(str.slice(Math.max(0, i - 3), i));
  }
  return parts.join('٬');
}

/**
 * Compact formatting: ۱.۲ میلیون, ۳۸۰ هزار, etc.
 */
function formatCompact(
  abs: bigint,
  isNegative: boolean,
  unit: 'toman' | 'rial',
  showUnit: boolean,
): string {
  const sign = isNegative ? '−' : '';
  const unitSuffix = showUnit ? (unit === 'toman' ? ' تومان' : ' ﷼') : '';

  // Use BigInt arithmetic to avoid Number precision loss for large amounts
  if (abs >= 1_000_000_000n) {
    const whole = abs / 1_000_000_000n;
    const frac = (abs % 1_000_000_000n) / 100_000_000n;
    const display = frac > 0n ? `${whole}.${frac}` : `${whole}`;
    return `${sign}${toPersianDigits(display)} میلیارد${unitSuffix}`;
  }
  if (abs >= 1_000_000n) {
    const whole = abs / 1_000_000n;
    const frac = (abs % 1_000_000n) / 100_000n;
    const display = frac > 0n ? `${whole}.${frac}` : `${whole}`;
    return `${sign}${toPersianDigits(display)} میلیون${unitSuffix}`;
  }
  if (abs >= 1_000n) {
    const whole = abs / 1_000n;
    const frac = (abs % 1_000n) / 100n;
    const display = frac > 0n ? `${whole}.${frac}` : `${whole}`;
    return `${sign}${toPersianDigits(display)} هزار${unitSuffix}`;
  }

  return `${sign}${toPersianDigits(abs.toString())}${unitSuffix}`;
}

/**
 * Parse a Rial amount from an API string to BigInt.
 * Rejects non-integer strings.
 */
export function parseRialAmount(value: string): bigint {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid Rial amount: "${value}". Must be a non-negative integer string.`);
  }
  return BigInt(value);
}
