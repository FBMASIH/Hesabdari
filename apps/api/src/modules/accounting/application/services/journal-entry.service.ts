import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import type {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  JournalEntryQueryDto,
} from '@hesabdari/contracts';
import { JournalEntryRepository } from '../../infrastructure/repositories/journal-entry.repository';
import { PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { AuditService } from '../../../audit/application/services/audit.service';
import { ExchangeRateService } from './exchange-rate.service';
import { OrganizationService } from '../../../organizations/application/services/organization.service';
import { CurrencyRepository } from '../../infrastructure/repositories/currency.repository';
import {
  assertBaseCurrencyBalance,
  assertMinimumLines,
} from '../../domain/rules/journal-balancing.rule';
import { convertToBase, applyRoundingAdjustment } from '../../domain/rules/currency-conversion.rule';
import { assertPeriodOpen } from '../../domain/rules/period.rule';
import { NotFoundError, ConflictError } from '@/platform/errors';

@Injectable()
export class JournalEntryService {
  constructor(
    private readonly journalEntryRepository: JournalEntryRepository,
    private readonly periodRepository: PeriodRepository,
    private readonly auditService: AuditService,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly organizationService: OrganizationService,
    private readonly currencyRepository: CurrencyRepository,
  ) {}

  async findById(id: string, organizationId: string): Promise<unknown> {
    const entry = await this.journalEntryRepository.findById(id, organizationId);
    if (!entry) throw new NotFoundError('JournalEntry', id);
    return entry;
  }

  async findByOrganization(organizationId: string, query?: JournalEntryQueryDto): Promise<unknown> {
    return this.journalEntryRepository.findByOrganizationId(organizationId, {
      status: query?.status,
      fromDate: query?.fromDate,
      toDate: query?.toDate,
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 25,
      sortBy: query?.sortBy ?? 'createdAt',
      sortOrder: query?.sortOrder ?? 'desc',
    });
  }

  async create(organizationId: string, data: CreateJournalEntryDto, actorId: string): Promise<unknown> {
    if (data.idempotencyKey) {
      const existing = await this.journalEntryRepository.findByIdempotencyKey(
        organizationId,
        data.idempotencyKey,
      );
      if (existing) return existing;
    }

    const existingByNumber = await this.journalEntryRepository.findByNumber(
      organizationId,
      data.entryNumber,
    );
    if (existingByNumber) {
      throw new ConflictError(`Journal entry number ${data.entryNumber} already exists`);
    }

    const period = await this.periodRepository.findById(data.periodId, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', data.periodId);
    assertPeriodOpen(period.status);

    const org = await this.organizationService.findById(organizationId);
    const baseCurrencyId = (org as { defaultCurrencyId: string }).defaultCurrencyId;
    const baseCurrency = await this.currencyRepository.findById(baseCurrencyId);
    const baseDecimalPlaces = baseCurrency?.decimalPlaces ?? 0;

    const lines = await Promise.all(
      data.lines.map(async (line) => {
        const debitAmount = BigInt(line.debitAmount);
        const creditAmount = BigInt(line.creditAmount);
        const currencyId = line.currencyId;

        let exchangeRate: Decimal;
        if (currencyId === baseCurrencyId) {
          exchangeRate = new Decimal('1');
        } else if (line.exchangeRate) {
          exchangeRate = new Decimal(line.exchangeRate);
        } else {
          const resolved = await this.exchangeRateService.getRate(
            organizationId, currencyId, baseCurrencyId, data.date,
          );
          exchangeRate = resolved.rate;
        }

        return {
          accountId: line.accountId,
          currencyId,
          description: line.description ?? null,
          debitAmount,
          creditAmount,
          exchangeRate: exchangeRate.toString(),
          baseCurrencyDebitAmount: convertToBase(debitAmount, exchangeRate, baseDecimalPlaces),
          baseCurrencyCreditAmount: convertToBase(creditAmount, exchangeRate, baseDecimalPlaces),
        };
      }),
    );

    applyRoundingAdjustment(lines);
    assertMinimumLines(lines);
    assertBaseCurrencyBalance(lines);

    const entry = await this.journalEntryRepository.createWithLines({
      organizationId,
      periodId: data.periodId,
      baseCurrencyId,
      entryNumber: data.entryNumber,
      date: data.date,
      description: data.description,
      idempotencyKey: data.idempotencyKey,
      lines,
    });

    await this.auditService.log({
      organizationId,
      actorId,
      action: 'JOURNAL_ENTRY_CREATED',
      targetType: 'JournalEntry',
      targetId: (entry as { id: string }).id,
      metadata: { status: 'DRAFT', entryNumber: data.entryNumber },
    });

    return entry;
  }

  async update(id: string, organizationId: string, data: UpdateJournalEntryDto): Promise<unknown> {
    const entry = (await this.findById(id, organizationId)) as { status: string; date: Date };

    if (entry.status !== 'DRAFT') {
      throw new ConflictError('Only DRAFT journal entries can be edited');
    }

    let lines:
      | {
          accountId: string;
          currencyId: string;
          description: string | null;
          debitAmount: bigint;
          creditAmount: bigint;
          exchangeRate: string;
          baseCurrencyDebitAmount: bigint;
          baseCurrencyCreditAmount: bigint;
        }[]
      | undefined;

    if (data.lines) {
      const org = await this.organizationService.findById(organizationId);
      const baseCurrencyId = (org as { defaultCurrencyId: string }).defaultCurrencyId;
      const baseCurrency = await this.currencyRepository.findById(baseCurrencyId);
      const baseDecimalPlaces = baseCurrency?.decimalPlaces ?? 0;
      const entryDate = data.date ?? entry.date;

      lines = await Promise.all(
        data.lines.map(async (line) => {
          const debitAmount = BigInt(line.debitAmount);
          const creditAmount = BigInt(line.creditAmount);
          const currencyId = line.currencyId;

          let exchangeRate: Decimal;
          if (currencyId === baseCurrencyId) {
            exchangeRate = new Decimal('1');
          } else if (line.exchangeRate) {
            exchangeRate = new Decimal(line.exchangeRate);
          } else {
            const resolved = await this.exchangeRateService.getRate(
              organizationId, currencyId, baseCurrencyId, entryDate,
            );
            exchangeRate = resolved.rate;
          }

          return {
            accountId: line.accountId,
            currencyId,
            description: line.description ?? null,
            debitAmount,
            creditAmount,
            exchangeRate: exchangeRate.toString(),
            baseCurrencyDebitAmount: convertToBase(debitAmount, exchangeRate, baseDecimalPlaces),
            baseCurrencyCreditAmount: convertToBase(creditAmount, exchangeRate, baseDecimalPlaces),
          };
        }),
      );

      applyRoundingAdjustment(lines);
      assertMinimumLines(lines);
      assertBaseCurrencyBalance(lines);
    }

    return this.journalEntryRepository.updateWithLines(
      id,
      organizationId,
      { date: data.date, description: data.description },
      lines,
    );
  }

  async post(id: string, organizationId: string, postedBy: string): Promise<unknown> {
    const entry = (await this.findById(id, organizationId)) as {
      periodId: string;
      lines: { baseCurrencyDebitAmount: bigint; baseCurrencyCreditAmount: bigint }[];
    };

    const period = await this.periodRepository.findById(entry.periodId, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', entry.periodId);

    assertPeriodOpen(period.status);
    assertMinimumLines(entry.lines);
    assertBaseCurrencyBalance(entry.lines);

    const posted = await this.journalEntryRepository.updateStatus(
      id,
      organizationId,
      'POSTED',
      new Date(),
      postedBy,
    );

    await this.auditService.log({
      organizationId,
      actorId: postedBy,
      action: 'JOURNAL_ENTRY_POSTED',
      targetType: 'JournalEntry',
      targetId: id,
      metadata: { before: { status: 'DRAFT' }, after: { status: 'POSTED' } },
    });

    return posted;
  }
}
