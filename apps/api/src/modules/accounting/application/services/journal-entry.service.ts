import { Injectable } from '@nestjs/common';
import type {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  JournalEntryQueryDto,
} from '@hesabdari/contracts';
import { type JournalEntryRepository } from '../../infrastructure/repositories/journal-entry.repository';
import { type PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { type AuditService } from '../../../audit/application/services/audit.service';
import {
  assertJournalBalances,
  assertMinimumLines,
} from '../../domain/rules/journal-balancing.rule';
import { assertPeriodOpen } from '../../domain/rules/period.rule';
import { NotFoundError, ConflictError } from '@/platform/errors';

@Injectable()
export class JournalEntryService {
  constructor(
    private readonly journalEntryRepository: JournalEntryRepository,
    private readonly periodRepository: PeriodRepository,
    private readonly auditService: AuditService,
  ) {}

  async findById(id: string, organizationId: string) {
    const entry = await this.journalEntryRepository.findById(id, organizationId);
    if (!entry) throw new NotFoundError('JournalEntry', id);
    return entry;
  }

  async findByOrganization(organizationId: string, query?: JournalEntryQueryDto) {
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

  async create(organizationId: string, data: CreateJournalEntryDto, actorId: string) {
    // Idempotency check: return existing entry if idempotency key matches
    if (data.idempotencyKey) {
      const existing = await this.journalEntryRepository.findByIdempotencyKey(
        organizationId,
        data.idempotencyKey,
      );
      if (existing) return existing;
    }

    // Check entry number uniqueness per org
    const existingByNumber = await this.journalEntryRepository.findByNumber(
      organizationId,
      data.entryNumber,
    );
    if (existingByNumber) {
      throw new ConflictError(`Journal entry number ${data.entryNumber} already exists`);
    }

    // Validate period is open
    const period = await this.periodRepository.findById(data.periodId, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', data.periodId);
    assertPeriodOpen(period.status);

    // Transform lines: strings to BigInt
    const lines = data.lines.map((line) => ({
      accountId: line.accountId,
      description: line.description ?? null,
      debitAmount: BigInt(line.debitAmount),
      creditAmount: BigInt(line.creditAmount),
    }));

    // Validate accounting rules
    assertMinimumLines(lines);
    assertJournalBalances(lines);

    const entry = await this.journalEntryRepository.createWithLines({
      organizationId,
      periodId: data.periodId,
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
      targetId: entry.id,
      metadata: { status: 'DRAFT', entryNumber: data.entryNumber },
    });

    return entry;
  }

  async update(id: string, organizationId: string, data: UpdateJournalEntryDto) {
    const entry = await this.findById(id, organizationId);

    // Only DRAFT entries can be edited (immutable ledger rule)
    if (entry.status !== 'DRAFT') {
      throw new ConflictError('Only DRAFT journal entries can be edited');
    }

    let lines:
      | {
          accountId: string;
          description: string | null;
          debitAmount: bigint;
          creditAmount: bigint;
        }[]
      | undefined;
    if (data.lines) {
      lines = data.lines.map((line) => ({
        accountId: line.accountId,
        description: line.description ?? null,
        debitAmount: BigInt(line.debitAmount),
        creditAmount: BigInt(line.creditAmount),
      }));
      assertMinimumLines(lines);
      assertJournalBalances(lines);
    }

    return this.journalEntryRepository.updateWithLines(
      id,
      organizationId,
      { date: data.date, description: data.description },
      lines,
    );
  }

  async post(id: string, organizationId: string, postedBy: string) {
    const entry = await this.findById(id, organizationId);

    const period = await this.periodRepository.findById(entry.periodId, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', entry.periodId);

    assertPeriodOpen(period.status);
    assertMinimumLines(entry.lines);
    assertJournalBalances(entry.lines);

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
