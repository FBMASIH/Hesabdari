import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import type { CreateExchangeRateDto, UpdateExchangeRateDto, ExchangeRateQueryDto } from '@hesabdari/contracts';
import { ExchangeRateRepository } from '../../infrastructure/repositories/exchange-rate.repository';
import { CurrencyRepository } from '../../infrastructure/repositories/currency.repository';
import { ExchangeRateFetcher } from '../../infrastructure/external/exchange-rate-fetcher';
import { NotFoundError, ConflictError, ApplicationError } from '@/platform/errors';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    private readonly exchangeRateRepository: ExchangeRateRepository,
    private readonly currencyRepository: CurrencyRepository,
    private readonly exchangeRateFetcher: ExchangeRateFetcher,
  ) {}

  async findAll(organizationId: string, query?: ExchangeRateQueryDto): Promise<unknown> {
    return this.exchangeRateRepository.findAll(organizationId, {
      fromCurrencyId: query?.fromCurrencyId,
      toCurrencyId: query?.toCurrencyId,
      startDate: query?.startDate,
      endDate: query?.endDate,
      source: query?.source,
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 25,
      sortBy: query?.sortBy ?? 'date',
      sortOrder: query?.sortOrder ?? 'desc',
    });
  }

  async findById(id: string, organizationId: string): Promise<unknown> {
    const rate = await this.exchangeRateRepository.findById(id, organizationId);
    if (!rate) throw new NotFoundError('ExchangeRate', id);
    return rate;
  }

  async createManual(organizationId: string, data: CreateExchangeRateDto): Promise<unknown> {
    if (data.fromCurrencyId === data.toCurrencyId) {
      throw new ApplicationError('SAME_CURRENCY', 'Cannot create exchange rate for same currency', 422);
    }

    // H4: Reject zero or negative rates at service level
    const rateValue = new Decimal(data.rate);
    if (rateValue.lte(0)) {
      throw new ApplicationError('INVALID_RATE', 'Exchange rate must be positive', 422);
    }

    const [fromCurrency, toCurrency] = await Promise.all([
      this.currencyRepository.findById(data.fromCurrencyId),
      this.currencyRepository.findById(data.toCurrencyId),
    ]);
    if (!fromCurrency) throw new NotFoundError('Currency', data.fromCurrencyId);
    if (!toCurrency) throw new NotFoundError('Currency', data.toCurrencyId);

    // C3: Use explicit UTC date to prevent timezone shift on @db.Date columns
    const rateDate = new Date(data.date + 'T00:00:00.000Z');

    try {
      return await this.exchangeRateRepository.create({
        organizationId,
        fromCurrencyId: data.fromCurrencyId,
        toCurrencyId: data.toCurrencyId,
        rate: data.rate,
        date: rateDate,
        source: 'MANUAL',
      });
    } catch (error) {
      // M3: Only treat unique constraint violations as conflicts
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictError(
          `Exchange rate for ${fromCurrency.code} to ${toCurrency.code} on ${data.date} already exists`,
        );
      }
      throw error;
    }
  }

  async updateManual(id: string, organizationId: string, data: Omit<UpdateExchangeRateDto, 'id'>): Promise<unknown> {
    const existing = (await this.findById(id, organizationId)) as { source: string };
    if (existing.source !== 'MANUAL') {
      throw new ApplicationError('CANNOT_EDIT_API_RATE', 'Only manual rates can be edited', 422);
    }
    const updated = await this.exchangeRateRepository.update(id, organizationId, data.rate);
    if (!updated) throw new NotFoundError('ExchangeRate', id);
    return updated;
  }

  async deleteManual(id: string, organizationId: string): Promise<void> {
    const existing = (await this.findById(id, organizationId)) as { source: string };
    if (existing.source !== 'MANUAL') {
      throw new ApplicationError('CANNOT_DELETE_API_RATE', 'Only manual rates can be deleted', 422);
    }
    const deleted = await this.exchangeRateRepository.delete(id, organizationId);
    if (!deleted) throw new NotFoundError('ExchangeRate', id);
  }

  /**
   * Resolve the exchange rate for a currency pair on a date.
   * Priority: manual rate > API rate > most recent rate.
   */
  async getRate(
    organizationId: string,
    fromCurrencyId: string,
    toCurrencyId: string,
    date: Date,
  ): Promise<{ rate: Decimal; source: string; isStale: boolean }> {
    if (fromCurrencyId === toCurrencyId) {
      return { rate: new Decimal('1'), source: 'identity', isStale: false };
    }

    const exactRate = (await this.exchangeRateRepository.findRate(
      organizationId, fromCurrencyId, toCurrencyId, date,
    )) as { rate: { toString(): string }; source: string } | null;
    if (exactRate) {
      return { rate: new Decimal(exactRate.rate.toString()), source: exactRate.source, isStale: false };
    }

    const latestRate = (await this.exchangeRateRepository.findLatestRate(
      organizationId, fromCurrencyId, toCurrencyId, date,
    )) as { rate: { toString(): string }; source: string; date: Date } | null;
    if (latestRate) {
      const daysDiff = Math.floor(
        (date.getTime() - new Date(latestRate.date).getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        rate: new Decimal(latestRate.rate.toString()),
        source: latestRate.source,
        isStale: daysDiff > 7,
      };
    }

    throw new ApplicationError(
      'NO_EXCHANGE_RATE',
      'No exchange rate found for the given currency pair',
      422,
    );
  }

  /**
   * Sync exchange rates from external API for all active currencies in the org.
   */
  async syncFromApi(
    organizationId: string,
    baseCurrencyCode: string,
    baseCurrencyId: string,
  ): Promise<{ synced: number; errors: string[] }> {
    const activeCurrencies = await this.currencyRepository.findAll(true);
    const errors: string[] = [];
    let synced = 0;

    try {
      const { date, rates } = await this.exchangeRateFetcher.fetchRates(baseCurrencyCode);
      const rateDate = new Date(date + 'T00:00:00.000Z');

      for (const currency of activeCurrencies) {
        if (currency.id === baseCurrencyId) continue;

        const targetCode = currency.code.toLowerCase();
        const apiRate = rates.get(targetCode);

        if (!apiRate) {
          errors.push(`No rate found for ${currency.code}`);
          continue;
        }

        try {
          // For IRR base: TGJU gives "1 foreign = X IRR" directly (no inversion).
          // For other bases: fawazahmed0 gives "1 base = X target" (need inversion).
          const isIrrBase = baseCurrencyCode.toUpperCase() === 'IRR';
          const foreignToBaseRate = isIrrBase
            ? apiRate  // TGJU: already "1 foreign = X IRR"
            : new Decimal(1).div(apiRate).toDecimalPlaces(8, Decimal.ROUND_HALF_UP);  // fawazahmed0: invert

          await this.exchangeRateRepository.upsert({
            organizationId,
            fromCurrencyId: currency.id,
            toCurrencyId: baseCurrencyId,
            rate: foreignToBaseRate.toString(),
            date: rateDate,
            source: 'API',
          });
          synced++;
        } catch (error) {
          errors.push(`Failed to store rate for ${currency.code}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to fetch rates: ${error}`);
    }

    this.logger.log(`Synced ${synced} rates for org ${organizationId}, errors: ${errors.length}`);
    return { synced, errors };
  }
}
