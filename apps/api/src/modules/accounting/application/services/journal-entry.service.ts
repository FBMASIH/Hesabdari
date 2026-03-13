import { Injectable } from '@nestjs/common';
import type { JournalEntryRepository } from '../../infrastructure/repositories/journal-entry.repository';
import type { PeriodRepository } from '../../infrastructure/repositories/period.repository';
import {
  assertJournalBalances,
  assertMinimumLines,
} from '../../domain/rules/journal-balancing.rule';
import { assertPeriodOpen } from '../../domain/rules/period.rule';
import { NotFoundError } from '@/platform/errors';

@Injectable()
export class JournalEntryService {
  constructor(
    private readonly journalEntryRepository: JournalEntryRepository,
    private readonly periodRepository: PeriodRepository,
  ) {}

  async findById(id: string, organizationId: string) {
    const entry = await this.journalEntryRepository.findById(id, organizationId);
    if (!entry) throw new NotFoundError('JournalEntry', id);
    return entry;
  }

  async findByOrganization(organizationId: string) {
    return this.journalEntryRepository.findByOrganizationId(organizationId);
  }

  async post(id: string, organizationId: string, postedBy: string) {
    const entry = await this.findById(id, organizationId);

    const period = await this.periodRepository.findById(entry.periodId, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', entry.periodId);

    assertPeriodOpen(period.status);
    assertMinimumLines(entry.lines);
    assertJournalBalances(entry.lines);

    await this.journalEntryRepository.updateStatus(id, 'POSTED', new Date(), postedBy);
  }
}
