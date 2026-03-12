import { Injectable } from '@nestjs/common';
import { JournalEntryRepository } from '../../infrastructure/repositories/journal-entry.repository';
import { PeriodRepository } from '../../infrastructure/repositories/period.repository';
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

  async findById(id: string) {
    const entry = await this.journalEntryRepository.findById(id);
    if (!entry) throw new NotFoundError('JournalEntry', id);
    return entry;
  }

  async findByOrganization(organizationId: string) {
    return this.journalEntryRepository.findByOrganizationId(organizationId);
  }

  async post(id: string, postedBy: string) {
    const entry = await this.findById(id);

    const period = await this.periodRepository.findById(entry.periodId);
    if (!period) throw new NotFoundError('AccountingPeriod', entry.periodId);

    assertPeriodOpen(period.status);
    assertMinimumLines(entry.lines);
    assertJournalBalances(entry.lines);

    await this.journalEntryRepository.updateStatus(id, 'POSTED', new Date(), postedBy);
  }
}
