import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { JournalEntryStatus } from '@hesabdari/db';

interface CreateJournalEntryData {
  organizationId: string;
  periodId: string;
  entryNumber: string;
  date: Date;
  description: string;
  idempotencyKey?: string;
  lines: {
    accountId: string;
    description: string | null;
    debitAmount: bigint;
    creditAmount: bigint;
  }[];
}

@Injectable()
export class JournalEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string) {
    return this.prisma.journalEntry.findFirst({
      where: { id, organizationId },
      include: { lines: true },
    });
  }

  async findByNumber(organizationId: string, entryNumber: string) {
    return this.prisma.journalEntry.findFirst({
      where: { organizationId, entryNumber },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return this.prisma.journalEntry.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    });
  }

  async createWithLines(data: CreateJournalEntryData) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          organizationId: data.organizationId,
          periodId: data.periodId,
          entryNumber: data.entryNumber,
          date: data.date,
          description: data.description,
          status: 'DRAFT',
          idempotencyKey: data.idempotencyKey ?? null,
          lines: {
            create: data.lines.map((line) => ({
              accountId: line.accountId,
              description: line.description,
              debitAmount: line.debitAmount,
              creditAmount: line.creditAmount,
            })),
          },
        },
        include: { lines: true },
      });
      return entry;
    });
  }

  async updateWithLines(
    id: string,
    data: { date?: Date; description?: string },
    lines?: { accountId: string; description: string | null; debitAmount: bigint; creditAmount: bigint }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (lines) {
        // Delete old lines and create new ones
        await tx.journalLine.deleteMany({ where: { journalEntryId: id } });
        await tx.journalLine.createMany({
          data: lines.map((line) => ({
            journalEntryId: id,
            accountId: line.accountId,
            description: line.description,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
          })),
        });
      }
      return tx.journalEntry.update({
        where: { id },
        data: {
          ...(data.date !== undefined && { date: data.date }),
          ...(data.description !== undefined && { description: data.description }),
        },
        include: { lines: true },
      });
    });
  }

  async updateStatus(id: string, status: JournalEntryStatus, postedAt?: Date, postedBy?: string) {
    return this.prisma.journalEntry.update({
      where: { id },
      data: { status, postedAt, postedBy },
    });
  }
}
