import { Injectable } from '@nestjs/common';
import { type PrismaService } from '@/platform/database/prisma.service';
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

  async findByOrganizationId(
    organizationId: string,
    opts?: {
      status?: string;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Record<string, unknown> = { organizationId };
    if (opts?.status) where.status = opts.status;
    if (opts?.fromDate || opts?.toDate) {
      where.date = {
        ...(opts?.fromDate ? { gte: opts.fromDate } : {}),
        ...(opts?.toDate ? { lte: opts.toDate } : {}),
      };
    }

    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 25;
    const orderBy = { [opts?.sortBy ?? 'createdAt']: opts?.sortOrder ?? 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        orderBy,
        include: { lines: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return { data, total, page, pageSize };
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
    organizationId: string,
    data: { date?: Date; description?: string },
    lines?: {
      accountId: string;
      description: string | null;
      debitAmount: bigint;
      creditAmount: bigint;
    }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Verify ownership before mutation
      const existing = await tx.journalEntry.findFirst({ where: { id, organizationId } });
      if (!existing) return null;

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
      // Use updateMany with status guard to prevent race conditions
      const result = await tx.journalEntry.updateMany({
        where: { id, organizationId, status: 'DRAFT' },
        data: {
          ...(data.date !== undefined && { date: data.date }),
          ...(data.description !== undefined && { description: data.description }),
        },
      });
      if (result.count === 0) return null;
      return tx.journalEntry.findFirst({
        where: { id, organizationId },
        include: { lines: true },
      });
    });
  }

  async findByIdempotencyKey(organizationId: string, idempotencyKey: string) {
    return this.prisma.journalEntry.findFirst({
      where: { organizationId, idempotencyKey },
      include: { lines: true },
    });
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: JournalEntryStatus,
    postedAt?: Date,
    postedBy?: string,
  ) {
    // Scope update by organizationId — updateMany accepts non-unique where
    const result = await this.prisma.journalEntry.updateMany({
      where: { id, organizationId },
      data: { status, postedAt, postedBy },
    });
    return result;
  }
}
