import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';

interface FetchedRates {
  date: string;
  rates: Map<string, Decimal>;
}

/**
 * TGJU key → ISO currency code mapping.
 * TGJU (tgju.org) provides real Iranian free market exchange rates.
 * Values are in IRR (Rial).
 */
const TGJU_CURRENCY_MAP: Record<string, string> = {
  price_dollar_rl: 'USD',
  price_eur: 'EUR',
  price_gbp: 'GBP',
  price_aed: 'AED',
  price_try: 'TRY',
  price_afn: 'AFN',
  price_cny: 'CNY',
  price_inr: 'INR',
  price_pkr: 'PKR',
  price_rub: 'RUB',
  price_iqd: 'IQD',
};

/**
 * Fetches exchange rates from multiple sources:
 *
 * **Primary (for IRR):** TGJU (tgju.org) — Iranian free market rates.
 *   GET https://call4.tgju.org/ajax.json
 *   Returns real bazaar rates, not official/government rates.
 *
 * **Fallback:** fawazahmed0/exchange-api — free, unlimited, 150+ currencies.
 *   GET https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{code}.json
 *   Good for non-IRR base currencies or when TGJU is down.
 */
@Injectable()
export class ExchangeRateFetcher {
  private readonly logger = new Logger(ExchangeRateFetcher.name);

  private readonly TGJU_URL = 'https://call4.tgju.org/ajax.json';
  private readonly FAWAZ_PRIMARY =
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
  private readonly FAWAZ_FALLBACK =
    'https://latest.currency-api.pages.dev/v1/currencies';

  /**
   * Fetch exchange rates. For IRR base, uses TGJU (real market rates).
   * For other bases, uses fawazahmed0.
   */
  async fetchRates(baseCurrencyCode: string): Promise<FetchedRates> {
    const code = baseCurrencyCode.toUpperCase();

    // For IRR base: use TGJU (Iranian free market rates)
    if (code === 'IRR') {
      try {
        return await this.fetchFromTgju();
      } catch (error) {
        this.logger.warn(`TGJU failed, falling back to fawazahmed0: ${error}`);
        return this.fetchFromFawazahmed(baseCurrencyCode);
      }
    }

    // For other currencies: use fawazahmed0
    return this.fetchFromFawazahmed(baseCurrencyCode);
  }

  /**
   * Fetch from TGJU — Iranian free market rates.
   * Returns rates as: 1 unit of foreign currency = X IRR.
   * Values are in Rial (not Toman).
   */
  private async fetchFromTgju(): Promise<FetchedRates> {
    const response = await fetch(this.TGJU_URL);
    if (!response.ok) {
      throw new Error(`TGJU responded with ${response.status}`);
    }

    const data = (await response.json()) as Record<string, Record<string, { p: string }>>;
    const current = data.current;
    if (!current || typeof current !== 'object') {
      throw new Error('TGJU response missing "current" field');
    }

    const rates = new Map<string, Decimal>();
    const today = new Date().toISOString().split('T')[0]!;

    for (const [tgjuKey, isoCode] of Object.entries(TGJU_CURRENCY_MAP)) {
      const entry = current[tgjuKey];
      if (!entry || typeof entry !== 'object' || !('p' in entry)) continue;

      const rawValue = entry.p;

      // Remove thousand separators and parse directly to Decimal (no Number intermediary)
      const cleaned = rawValue.replace(/,/g, '');
      try {
        const parsed = new Decimal(cleaned);
        if (parsed.lte(0)) continue;
        // TGJU rates are already "1 foreign = X IRR" — exactly what we need
        rates.set(isoCode.toLowerCase(), parsed);
      } catch {
        continue;
      }
    }

    this.logger.log(`TGJU: fetched ${rates.size} free market rates (date: ${today})`);
    return { date: today, rates };
  }

  /**
   * Fetch from fawazahmed0/exchange-api — free, unlimited, daily.
   * Returns rates as: 1 unit of base = X units of target.
   */
  private async fetchFromFawazahmed(baseCurrencyCode: string): Promise<FetchedRates> {
    const code = baseCurrencyCode.toLowerCase();

    for (const baseUrl of [this.FAWAZ_PRIMARY, this.FAWAZ_FALLBACK]) {
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

        this.logger.log(`fawazahmed0: fetched ${rates.size} rates for ${code} (date: ${date})`);
        return { date, rates };
      } catch (error) {
        this.logger.warn(`Error fetching from ${baseUrl}: ${error}`);
      }
    }

    throw new Error(`Failed to fetch exchange rates for ${baseCurrencyCode} from all sources`);
  }

}
