import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { JournalEntryStatus } from '@hesabdari/db';

interface CreateJournalEntryData {
  organizationId: string;
  periodId: string;
  baseCurrencyId: string;
  entryNumber: string;
  date: Date;
  description: string;
  idempotencyKey?: string;
  lines: {
    accountId: string;
    currencyId: string;
    description: string | null;
    debitAmount: bigint;
    creditAmount: bigint;
    exchangeRate: string;
    baseCurrencyDebitAmount: bigint;
    baseCurrencyCreditAmount: bigint;
  }[];
}

@Injectable()
export class JournalEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string): Promise<unknown> {
    return this.prisma.journalEntry.findFirst({
      where: { id, organizationId },
      include: { lines: { include: { currency: true } }, baseCurrency: true },
    });
  }

  async findByNumber(organizationId: string, entryNumber: string): Promise<unknown> {
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
  ): Promise<unknown> {
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
        include: { lines: { include: { currency: true } }, baseCurrency: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  async createWithLines(data: CreateJournalEntryData): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          organizationId: data.organizationId,
          periodId: data.periodId,
          baseCurrencyId: data.baseCurrencyId,
          entryNumber: data.entryNumber,
          date: data.date,
          description: data.description,
          status: 'DRAFT',
          idempotencyKey: data.idempotencyKey ?? null,
          lines: {
            create: data.lines.map((line) => ({
              accountId: line.accountId,
              currencyId: line.currencyId,
              description: line.description,
              debitAmount: line.debitAmount,
              creditAmount: line.creditAmount,
              exchangeRate: line.exchangeRate,
              baseCurrencyDebitAmount: line.baseCurrencyDebitAmount,
              baseCurrencyCreditAmount: line.baseCurrencyCreditAmount,
            })),
          },
        },
        include: { lines: { include: { currency: true } }, baseCurrency: true },
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
      currencyId: string;
      description: string | null;
      debitAmount: bigint;
      creditAmount: bigint;
      exchangeRate: string;
      baseCurrencyDebitAmount: bigint;
      baseCurrencyCreditAmount: bigint;
    }[],
  ): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      // Check status BEFORE touching lines to prevent TOCTOU corruption
      const existing = await tx.journalEntry.findFirst({
        where: { id, organizationId, status: 'DRAFT' },
      });
      if (!existing) return null;

      if (lines) {
        await tx.journalLine.deleteMany({ where: { journalEntryId: id } });
        await tx.journalLine.createMany({
          data: lines.map((line) => ({
            journalEntryId: id,
            accountId: line.accountId,
            currencyId: line.currencyId,
            description: line.description,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            exchangeRate: line.exchangeRate,
            baseCurrencyDebitAmount: line.baseCurrencyDebitAmount,
            baseCurrencyCreditAmount: line.baseCurrencyCreditAmount,
          })),
        });
      }

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
        include: { lines: { include: { currency: true } }, baseCurrency: true },
      });
    });
  }

  async findByIdempotencyKey(organizationId: string, idempotencyKey: string): Promise<unknown> {
    return this.prisma.journalEntry.findFirst({
      where: { organizationId, idempotencyKey },
      include: { lines: { include: { currency: true } }, baseCurrency: true },
    });
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: JournalEntryStatus,
    postedAt?: Date,
    postedBy?: string,
  ): Promise<unknown> {
    const result = await this.prisma.journalEntry.updateMany({
      where: { id, organizationId },
      data: { status, postedAt, postedBy },
    });
    if (result.count === 0) return null;
    return this.prisma.journalEntry.findFirst({
      where: { id, organizationId },
      include: { lines: { include: { currency: true } }, baseCurrency: true },
    });
  }
}
