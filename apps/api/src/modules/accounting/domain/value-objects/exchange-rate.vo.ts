import { Decimal } from 'decimal.js';
import { DomainError } from '../errors/domain.error';

/**
 * Value object for exchange rates.
 * Convention: 1 unit of fromCurrency = rate units of toCurrency.
 */
export class ExchangeRateVO {
  private constructor(
    public readonly fromCurrencyId: string,
    public readonly toCurrencyId: string,
    public readonly rate: Decimal,
    public readonly date: Date,
  ) {}

  static create(
    fromCurrencyId: string,
    toCurrencyId: string,
    rate: Decimal | string,
    date: Date,
  ): ExchangeRateVO {
    const rateDecimal = rate instanceof Decimal ? rate : new Decimal(rate);

    if (rateDecimal.lte(0)) {
      throw new DomainError('INVALID_EXCHANGE_RATE', 'Exchange rate must be positive');
    }

    if (fromCurrencyId === toCurrencyId) {
      throw new DomainError('SAME_CURRENCY_RATE', 'Cannot create exchange rate for same currency');
    }

    return new ExchangeRateVO(fromCurrencyId, toCurrencyId, rateDecimal, date);
  }

  inverse(): ExchangeRateVO {
    const inverseRate = new Decimal(1).div(this.rate).toDecimalPlaces(8, Decimal.ROUND_HALF_UP);
    return new ExchangeRateVO(this.toCurrencyId, this.fromCurrencyId, inverseRate, this.date);
  }

  isIdentity(): boolean {
    return this.rate.eq(1);
  }
}
