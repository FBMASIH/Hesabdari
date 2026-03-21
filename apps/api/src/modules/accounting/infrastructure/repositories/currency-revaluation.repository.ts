import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';

@Injectable()
export class CurrencyRevaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    period: true,
    baseCurrency: true,
    journalEntry: { include: { lines: true } },
  };

  async findAll(
    organizationId: string,
    opts?: {
      periodId?: string;
      status?: 'POSTED' | 'REVERSED';
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<unknown> {
    const where: Prisma.CurrencyRevaluationWhereInput = { organizationId };
    if (opts?.periodId) where.periodId = opts.periodId;
    if (opts?.status) where.status = opts.status;

    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 25;
    const orderBy = { [opts?.sortBy ?? 'date']: opts?.sortOrder ?? 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.currencyRevaluation.findMany({
        where,
        orderBy,
        include: this.include,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.currencyRevaluation.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  async findById(id: string, organizationId: string): Promise<unknown> {
    return this.prisma.currencyRevaluation.findFirst({
      where: { id, organizationId },
      include: this.include,
    });
  }

  async create(data: {
    organizationId: string;
    periodId: string;
    baseCurrencyId: string;
    date: Date;
    description: string | null;
    journalEntryId: string;
    metadata: Record<string, unknown>;
  }): Promise<unknown> {
    return this.prisma.currencyRevaluation.create({
      data: {
        organizationId: data.organizationId,
        periodId: data.periodId,
        baseCurrencyId: data.baseCurrencyId,
        date: data.date,
        description: data.description,
        journalEntryId: data.journalEntryId,
        status: 'POSTED',
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      include: this.include,
    });
  }

  async updateStatus(id: string, organizationId: string, status: 'POSTED' | 'REVERSED'): Promise<unknown> {
    const result = await this.prisma.currencyRevaluation.updateMany({
      where: { id, organizationId },
      data: { status },
    });
    if (result.count === 0) return null;
    return this.findById(id, organizationId);
  }
}
