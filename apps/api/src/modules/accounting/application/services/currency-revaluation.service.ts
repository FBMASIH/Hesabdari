import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import type { CreateRevaluationDto, RevaluationQueryDto } from '@hesabdari/contracts';
import { CurrencyRevaluationRepository } from '../../infrastructure/repositories/currency-revaluation.repository';
import { JournalEntryRepository } from '../../infrastructure/repositories/journal-entry.repository';
import { ExchangeRateService } from './exchange-rate.service';
import { OrganizationService } from '../../../organizations/application/services/organization.service';
import { PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { AccountRepository } from '../../infrastructure/repositories/account.repository';
import { CurrencyRepository } from '../../infrastructure/repositories/currency.repository';
import { AuditService } from '../../../audit/application/services/audit.service';
import { assertPeriodOpen } from '../../domain/rules/period.rule';
import { NotFoundError, ApplicationError } from '@/platform/errors';

@Injectable()
export class CurrencyRevaluationService {
  constructor(
    private readonly revaluationRepository: CurrencyRevaluationRepository,
    private readonly journalEntryRepository: JournalEntryRepository,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly organizationService: OrganizationService,
    private readonly periodRepository: PeriodRepository,
    private readonly accountRepository: AccountRepository,
    private readonly currencyRepository: CurrencyRepository,
    private readonly auditService: AuditService,
  ) {}

  async findAll(organizationId: string, query?: RevaluationQueryDto): Promise<unknown> {
    return this.revaluationRepository.findAll(organizationId, {
      periodId: query?.periodId,
      status: query?.status,
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 25,
      sortBy: query?.sortBy ?? 'date',
      sortOrder: query?.sortOrder ?? 'desc',
    });
  }

  async findById(id: string, organizationId: string): Promise<unknown> {
    const reval = await this.revaluationRepository.findById(id, organizationId);
    if (!reval) throw new NotFoundError('CurrencyRevaluation', id);
    return reval;
  }

  async revalue(
    organizationId: string,
    data: CreateRevaluationDto,
    actorId: string,
  ): Promise<unknown> {
    // Validate period
    const period = await this.periodRepository.findById(data.periodId, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', data.periodId);
    assertPeriodOpen(period.status);

    // Get org base currency
    const org = await this.organizationService.findById(organizationId);
    const baseCurrencyId = (org as { defaultCurrencyId: string }).defaultCurrencyId;
    const baseCurrency = await this.currencyRepository.findById(baseCurrencyId);
    if (!baseCurrency) throw new NotFoundError('Currency', baseCurrencyId);

    const revalDate = new Date(data.date + 'T00:00:00.000Z');

    // Find exchange gain/loss accounts
    const allAccounts = await this.accountRepository.findByOrganizationId(organizationId);
    const accounts = allAccounts as { id: string; code: string; name: string; type: string }[];
    const gainAccount = accounts.find((a) => a.code === '7100');
    const lossAccount = accounts.find((a) => a.code === '7200');
    if (!gainAccount || !lossAccount) {
      throw new ApplicationError(
        'MISSING_REVAL_ACCOUNTS',
        'Exchange gain (7100) and loss (7200) accounts are required for revaluation',
        422,
      );
    }

    // Get all foreign-currency journal lines grouped by currency
    // Sum baseCurrency amounts (book value) and original amounts per currency
    const allEntries = await this.journalEntryRepository.findByOrganizationId(organizationId, {
      status: 'POSTED',
      page: 1,
      pageSize: 100000, // Get all posted entries
    });
    const entries = (allEntries as { data: { lines: { currencyId: string; debitAmount: bigint; creditAmount: bigint; baseCurrencyDebitAmount: bigint; baseCurrencyCreditAmount: bigint }[] }[] }).data;

    // Aggregate by currency: original balance and book value (in base currency)
    const currencyBalances = new Map<string, { originalNet: bigint; bookValueNet: bigint }>();
    for (const entry of entries) {
      for (const line of entry.lines) {
        if (line.currencyId === baseCurrencyId) continue;
        const bal = currencyBalances.get(line.currencyId) ?? { originalNet: 0n, bookValueNet: 0n };
        bal.originalNet += BigInt(line.debitAmount) - BigInt(line.creditAmount);
        bal.bookValueNet += BigInt(line.baseCurrencyDebitAmount) - BigInt(line.baseCurrencyCreditAmount);
        currencyBalances.set(line.currencyId, bal);
      }
    }

    if (currencyBalances.size === 0) {
      throw new ApplicationError('NO_FOREIGN_BALANCES', 'No foreign currency balances to revalue', 422);
    }

    // Calculate gain/loss per currency
    const revalDetails: Array<{
      currencyId: string;
      currencyCode: string;
      originalNet: string;
      bookValue: string;
      currentValue: string;
      gainOrLoss: string;
      rate: string;
    }> = [];
    let totalGainLoss = 0n;

    for (const [currencyId, balance] of currencyBalances) {
      if (balance.originalNet === 0n) continue;

      const resolved = await this.exchangeRateService.getRate(
        organizationId, currencyId, baseCurrencyId, revalDate,
      );
      const currentRate = resolved.rate;

      // Current value = original balance * current rate
      const currentValue = BigInt(
        new Decimal(balance.originalNet.toString())
          .mul(currentRate)
          .toDecimalPlaces((baseCurrency as { decimalPlaces: number }).decimalPlaces, Decimal.ROUND_HALF_UP)
          .toFixed(0),
      );

      const gainOrLoss = currentValue - balance.bookValueNet;
      if (gainOrLoss === 0n) continue;

      totalGainLoss += gainOrLoss;

      const currency = await this.currencyRepository.findById(currencyId);
      revalDetails.push({
        currencyId,
        currencyCode: (currency as { code: string } | null)?.code ?? currencyId,
        originalNet: balance.originalNet.toString(),
        bookValue: balance.bookValueNet.toString(),
        currentValue: currentValue.toString(),
        gainOrLoss: gainOrLoss.toString(),
        rate: currentRate.toString(),
      });
    }

    if (totalGainLoss === 0n) {
      throw new ApplicationError('NO_GAIN_LOSS', 'Revaluation produced zero gain/loss', 422);
    }

    // Generate a unique entry number for the revaluation journal entry
    const entryNumber = `REVAL-${data.date.replace(/-/g, '')}`;

    // Create journal entry for gain/loss
    const lines: {
      accountId: string;
      currencyId: string;
      description: string | null;
      debitAmount: bigint;
      creditAmount: bigint;
      exchangeRate: string;
      baseCurrencyDebitAmount: bigint;
      baseCurrencyCreditAmount: bigint;
    }[] = [];

    if (totalGainLoss > 0n) {
      // Net gain: debit adjustment account, credit gain account
      lines.push({
        accountId: lossAccount.id,
        currencyId: baseCurrencyId,
        description: data.description ?? null,
        debitAmount: totalGainLoss,
        creditAmount: 0n,
        exchangeRate: '1',
        baseCurrencyDebitAmount: totalGainLoss,
        baseCurrencyCreditAmount: 0n,
      });
      lines.push({
        accountId: gainAccount.id,
        currencyId: baseCurrencyId,
        description: data.description ?? null,
        debitAmount: 0n,
        creditAmount: totalGainLoss,
        exchangeRate: '1',
        baseCurrencyDebitAmount: 0n,
        baseCurrencyCreditAmount: totalGainLoss,
      });
    } else {
      const absLoss = -totalGainLoss;
      // Net loss: debit loss account, credit adjustment account
      lines.push({
        accountId: lossAccount.id,
        currencyId: baseCurrencyId,
        description: data.description ?? null,
        debitAmount: absLoss,
        creditAmount: 0n,
        exchangeRate: '1',
        baseCurrencyDebitAmount: absLoss,
        baseCurrencyCreditAmount: 0n,
      });
      lines.push({
        accountId: gainAccount.id,
        currencyId: baseCurrencyId,
        description: data.description ?? null,
        debitAmount: 0n,
        creditAmount: absLoss,
        exchangeRate: '1',
        baseCurrencyDebitAmount: 0n,
        baseCurrencyCreditAmount: absLoss,
      });
    }

    const journalEntry = await this.journalEntryRepository.createWithLines({
      organizationId,
      periodId: data.periodId,
      baseCurrencyId,
      entryNumber,
      date: revalDate,
      description: data.description ?? `\u062A\u0633\u0639\u06CC\u0631 \u0627\u0631\u0632 ${data.date}`,
      lines,
    });

    const entryId = (journalEntry as { id: string }).id;

    // Post the journal entry immediately
    await this.journalEntryRepository.updateStatus(
      entryId,
      organizationId,
      'POSTED',
      new Date(),
      actorId,
    );

    // Create revaluation record
    const revaluation = await this.revaluationRepository.create({
      organizationId,
      periodId: data.periodId,
      baseCurrencyId,
      date: revalDate,
      description: data.description ?? null,
      journalEntryId: entryId,
      metadata: { currencies: revalDetails, totalGainLoss: totalGainLoss.toString() },
    });

    await this.auditService.log({
      organizationId,
      actorId,
      action: 'CURRENCY_REVALUATION_CREATED',
      targetType: 'CurrencyRevaluation',
      targetId: (revaluation as { id: string }).id,
      metadata: { totalGainLoss: totalGainLoss.toString(), currencies: revalDetails.length },
    });

    return revaluation;
  }

  async reverse(id: string, organizationId: string, actorId: string): Promise<unknown> {
    const reval = (await this.findById(id, organizationId)) as {
      status: string;
      journalEntryId: string;
      periodId: string;
    };

    if (reval.status !== 'POSTED') {
      throw new ApplicationError('INVALID_STATUS', 'Only POSTED revaluations can be reversed', 422);
    }

    // Mark the revaluation as REVERSED
    const updated = await this.revaluationRepository.updateStatus(id, organizationId, 'REVERSED');

    await this.auditService.log({
      organizationId,
      actorId,
      action: 'CURRENCY_REVALUATION_REVERSED',
      targetType: 'CurrencyRevaluation',
      targetId: id,
      metadata: {},
    });

    return updated;
  }
}
