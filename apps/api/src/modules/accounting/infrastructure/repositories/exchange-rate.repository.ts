import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';

@Injectable()
export class ExchangeRateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    opts?: {
      fromCurrencyId?: string;
      toCurrencyId?: string;
      startDate?: string;
      endDate?: string;
      source?: 'MANUAL' | 'API';
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<unknown> {
    const where: Prisma.ExchangeRateWhereInput = { organizationId };
    if (opts?.fromCurrencyId) where.fromCurrencyId = opts.fromCurrencyId;
    if (opts?.toCurrencyId) where.toCurrencyId = opts.toCurrencyId;
    if (opts?.source) where.source = opts.source;
    if (opts?.startDate || opts?.endDate) {
      where.date = {
        ...(opts?.startDate ? { gte: new Date(opts.startDate) } : {}),
        ...(opts?.endDate ? { lte: new Date(opts.endDate) } : {}),
      };
    }

    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 25;
    const orderBy = { [opts?.sortBy ?? 'date']: opts?.sortOrder ?? 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.exchangeRate.findMany({
        where,
        orderBy,
        include: { fromCurrency: true, toCurrency: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.exchangeRate.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  async findById(id: string, organizationId: string): Promise<unknown> {
    return this.prisma.exchangeRate.findFirst({
      where: { id, organizationId },
      include: { fromCurrency: true, toCurrency: true },
    });
  }

  async findRate(
    organizationId: string,
    fromCurrencyId: string,
    toCurrencyId: string,
    date: Date,
  ): Promise<unknown> {
    return this.prisma.exchangeRate.findFirst({
      where: { organizationId, fromCurrencyId, toCurrencyId, date },
      // M2: 'MANUAL' > 'API' alphabetically, so desc gives MANUAL priority
      orderBy: { source: 'desc' },
    });
  }

  async findLatestRate(
    organizationId: string,
    fromCurrencyId: string,
    toCurrencyId: string,
    beforeDate: Date,
  ): Promise<unknown> {
    return this.prisma.exchangeRate.findFirst({
      where: {
        organizationId,
        fromCurrencyId,
        toCurrencyId,
        date: { lte: beforeDate },
      },
      orderBy: [{ date: 'desc' }, { source: 'desc' }],
    });
  }

  async create(data: {
    organizationId: string;
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: Prisma.Decimal | string;
    date: Date;
    source: 'MANUAL' | 'API';
  }): Promise<unknown> {
    return this.prisma.exchangeRate.create({
      data: {
        organizationId: data.organizationId,
        fromCurrencyId: data.fromCurrencyId,
        toCurrencyId: data.toCurrencyId,
        rate: data.rate,
        date: data.date,
        source: data.source,
      },
      include: { fromCurrency: true, toCurrency: true },
    });
  }

  async upsert(data: {
    organizationId: string;
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: Prisma.Decimal | string;
    date: Date;
    source: 'MANUAL' | 'API';
  }): Promise<unknown> {
    return this.prisma.exchangeRate.upsert({
      where: {
        organizationId_fromCurrencyId_toCurrencyId_date: {
          organizationId: data.organizationId,
          fromCurrencyId: data.fromCurrencyId,
          toCurrencyId: data.toCurrencyId,
          date: data.date,
        },
      },
      update: { rate: data.rate, source: data.source },
      create: {
        organizationId: data.organizationId,
        fromCurrencyId: data.fromCurrencyId,
        toCurrencyId: data.toCurrencyId,
        rate: data.rate,
        date: data.date,
        source: data.source,
      },
    });
  }

  async update(id: string, organizationId: string, rate: Prisma.Decimal | string): Promise<unknown> {
    const result = await this.prisma.exchangeRate.updateMany({
      where: { id, organizationId, source: 'MANUAL' },
      data: { rate },
    });
    if (result.count === 0) return null;
    return this.findById(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.prisma.exchangeRate.deleteMany({
      where: { id, organizationId, source: 'MANUAL' },
    });
    return result.count > 0;
  }
}
