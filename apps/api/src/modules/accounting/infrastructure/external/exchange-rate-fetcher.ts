import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';

interface FetchedRates {
  date: string;
  rates: Map<string, Decimal>;
}

/**
 * Fetches exchange rates from the fawazahmed0/exchange-api (free, unlimited, daily).
 *
 * API format:
 *   GET https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{code}.json
 *   Response: { "date": "2026-03-20", "{code}": { "{target}": number, ... } }
 *
 * Currency codes are LOWERCASE in the API.
 */
@Injectable()
export class ExchangeRateFetcher {
  private readonly logger = new Logger(ExchangeRateFetcher.name);

  private readonly PRIMARY_URL =
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
  private readonly FALLBACK_URL =
    'https://latest.currency-api.pages.dev/v1/currencies';

  async fetchRates(baseCurrencyCode: string): Promise<FetchedRates> {
    const code = baseCurrencyCode.toLowerCase();

    for (const baseUrl of [this.PRIMARY_URL, this.FALLBACK_URL]) {
      try {
        const url = `${baseUrl}/${code}.json`;
        const response = await fetch(url);
        if (!response.ok) {
          this.logger.warn(`Failed to fetch from ${url}: ${response.status}`);
          continue;
        }

        const data = (await response.json()) as Record<string, unknown>;
        const date = data.date as string;
        const ratesObj = data[code] as Record<string, number> | undefined;

        if (!ratesObj || typeof ratesObj !== 'object') {
          this.logger.warn(`Invalid response format from ${url}`);
          continue;
        }

        const rates = new Map<string, Decimal>();
        for (const [targetCode, rateValue] of Object.entries(ratesObj)) {
          if (typeof rateValue === 'number' && rateValue > 0) {
            rates.set(targetCode, new Decimal(rateValue));
          }
        }

        this.logger.log(`Fetched ${rates.size} rates for ${code} (date: ${date})`);
        return { date, rates };
      } catch (error) {
        this.logger.warn(`Error fetching from ${baseUrl}: ${error}`);
      }
    }

    throw new Error(`Failed to fetch exchange rates for ${baseCurrencyCode} from all sources`);
  }

  async getRate(
    fromCurrencyCode: string,
    toCurrencyCode: string,
  ): Promise<{ rate: Decimal; date: string }> {
    const { date, rates } = await this.fetchRates(fromCurrencyCode);
    const targetCode = toCurrencyCode.toLowerCase();
    const rate = rates.get(targetCode);

    if (!rate) {
      throw new Error(`Rate not found for ${fromCurrencyCode} → ${toCurrencyCode}`);
    }

    return { rate, date };
  }
}
