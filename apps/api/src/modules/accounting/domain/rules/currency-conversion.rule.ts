import { Decimal } from 'decimal.js';
import { DomainError } from '../errors/domain.error';

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

/**
 * Convert an original-currency amount to base currency.
 * Exchange rate convention: 1 unit of original currency = exchangeRate units of base currency.
 * Rounding: HALF_UP per line, to base currency's decimal places.
 */
export function convertToBase(
  originalAmount: bigint,
  exchangeRate: Decimal,
  baseDecimalPlaces: number,
): bigint {
  if (originalAmount === 0n) return 0n;

  if (exchangeRate.lte(0)) {
    throw new DomainError('INVALID_EXCHANGE_RATE', 'Exchange rate must be positive');
  }

  const result = new Decimal(originalAmount.toString())
    .mul(exchangeRate)
    .toDecimalPlaces(baseDecimalPlaces, Decimal.ROUND_HALF_UP);

  return BigInt(result.toFixed(0));
}

/**
 * Apply rounding adjustment to force base currency balance.
 * After per-line conversion, rounding may cause a ±1 (or small) imbalance.
 * Adjusts the largest base-currency line to absorb the difference.
 * Standard ERP practice (SAP "rounding difference line").
 */
export function applyRoundingAdjustment(
  lines: {
    baseCurrencyDebitAmount: bigint;
    baseCurrencyCreditAmount: bigint;
    debitAmount: bigint;
    creditAmount: bigint;
  }[],
): void {
  const totalBaseDebits = lines.reduce((s, l) => s + l.baseCurrencyDebitAmount, 0n);
  const totalBaseCredits = lines.reduce((s, l) => s + l.baseCurrencyCreditAmount, 0n);
  const diff = totalBaseDebits - totalBaseCredits;

  if (diff === 0n) return;
  if (lines.length === 0) return;

  // Find the line with the largest base amount to absorb the rounding difference
  let maxIdx = 0;
  let maxAmt = 0n;
  for (const [i, line] of lines.entries()) {
    const amt = line.baseCurrencyDebitAmount > line.baseCurrencyCreditAmount
      ? line.baseCurrencyDebitAmount
      : line.baseCurrencyCreditAmount;
    if (amt > maxAmt) {
      maxAmt = amt;
      maxIdx = i;
    }
  }

  const target = lines[maxIdx]!;

  if (diff > 0n) {
    if (target.baseCurrencyDebitAmount > 0n) {
      target.baseCurrencyDebitAmount -= diff;
    } else {
      target.baseCurrencyCreditAmount += diff;
    }
  } else {
    if (target.baseCurrencyCreditAmount > 0n) {
      target.baseCurrencyCreditAmount += diff;
    } else {
      target.baseCurrencyDebitAmount -= diff;
    }
  }
}
