import type { JournalEntryEntity, JournalLineEntity } from '../entities/journal-entry.entity';

export interface IJournalEntryRepository {
  findById(
    id: string,
    organizationId: string,
  ): Promise<(JournalEntryEntity & { lines: JournalLineEntity[] }) | null>;
  findByOrganizationId(
    organizationId: string,
    options?: { status?: string },
  ): Promise<JournalEntryEntity[]>;
  save(
    entry: JournalEntryEntity,
    lines: Omit<JournalLineEntity, 'id' | 'createdAt'>[],
  ): Promise<JournalEntryEntity>;
  updateStatus(
    id: string,
    organizationId: string,
    status: string,
    postedAt?: Date,
    postedBy?: string,
  ): Promise<void>;
}
