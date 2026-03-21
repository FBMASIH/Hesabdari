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
  if (lines.length === 0) return;

  const totalBaseDebits = lines.reduce((s, l) => s + l.baseCurrencyDebitAmount, 0n);
  const totalBaseCredits = lines.reduce((s, l) => s + l.baseCurrencyCreditAmount, 0n);
  const diff = totalBaseDebits - totalBaseCredits;

  if (diff === 0n) return;

  // Only adjust small rounding differences (max ±lines.length to be safe).
  // Large imbalances indicate a real bug, not a rounding artifact.
  const absDiff = diff > 0n ? diff : -diff;
  const maxAllowedDiff = BigInt(lines.length);
  if (absDiff > maxAllowedDiff) {
    throw new DomainError(
      'ROUNDING_IMBALANCE_TOO_LARGE',
      `Base currency imbalance ${diff} exceeds maximum rounding adjustment (±${maxAllowedDiff})`,
    );
  }

  // Find the largest debit or credit line to absorb the rounding difference
  let debitIdx = -1;
  let maxDebit = 0n;
  let creditIdx = -1;
  let maxCredit = 0n;
  for (const [i, line] of lines.entries()) {
    if (line.baseCurrencyDebitAmount > maxDebit) {
      maxDebit = line.baseCurrencyDebitAmount;
      debitIdx = i;
    }
    if (line.baseCurrencyCreditAmount > maxCredit) {
      maxCredit = line.baseCurrencyCreditAmount;
      creditIdx = i;
    }
  }

  if (diff > 0n) {
    // Debits exceed credits — increase the largest credit line
    if (creditIdx >= 0) {
      lines[creditIdx]!.baseCurrencyCreditAmount += diff;
    }
  } else {
    // Credits exceed debits — increase the largest debit line
    if (debitIdx >= 0) {
      lines[debitIdx]!.baseCurrencyDebitAmount += (-diff);
    }
  }
}
