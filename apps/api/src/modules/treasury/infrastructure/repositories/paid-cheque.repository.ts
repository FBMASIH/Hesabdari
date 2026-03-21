import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import { NotFoundError } from '@/platform/errors';
import type { Prisma, PaidChequeStatus, PaidCheque } from '@hesabdari/db';

@Injectable()
export class PaidChequeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(
    organizationId: string,
    opts: {
      status?: string;
      vendorId?: string;
      bankAccountId?: string;
      fromDueDate?: Date;
      toDueDate?: Date;
      page: number;
      pageSize: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.PaidChequeWhereInput = { organizationId };
    if (opts.status) where.status = opts.status as PaidChequeStatus;
    if (opts.vendorId) where.vendorId = opts.vendorId;
    if (opts.bankAccountId) where.bankAccountId = opts.bankAccountId;
    if (opts.fromDueDate || opts.toDueDate) {
      where.dueDate = {
        ...(opts.fromDueDate ? { gte: opts.fromDueDate } : {}),
        ...(opts.toDueDate ? { lte: opts.toDueDate } : {}),
      };
    }

    const orderBy = { [opts.sortBy ?? 'dueDate']: opts.sortOrder ?? 'asc' };
    const [data, total] = await Promise.all([
      this.prisma.paidCheque.findMany({
        where,
        include: { bankAccount: true, vendor: true, currency: true },
        orderBy,
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.paidCheque.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.paidCheque.findFirst({
      where: { id, organizationId },
      include: { bankAccount: true, vendor: true, currency: true },
    });
  }

  async findBySayadiNumber(organizationId: string, sayadiNumber: string) {
    return this.prisma.paidCheque.findFirst({
      where: { organizationId, sayadiNumber },
    });
  }

  async create(data: {
    organizationId: string;
    vendorId?: string | null;
    bankAccountId: string;
    currencyId: string;
    chequeNumber: string;
    amount: bigint;
    date: Date;
    dueDate: Date;
    sayadiNumber?: string | null;
    description?: string | null;
  }) {
    return this.prisma.paidCheque.create({
      data: { ...data, status: 'OPEN' as PaidChequeStatus },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Prisma.PaidChequeUncheckedUpdateInput,
  ): Promise<PaidCheque> {
    await this.prisma.paidCheque.updateMany({ where: { id, organizationId }, data });
    const updated = await this.findById(id, organizationId);
    if (!updated) throw new NotFoundError('PaidCheque', id);
    return updated;
  }

  async updateStatus(id: string, organizationId: string, status: string): Promise<PaidCheque> {
    await this.prisma.paidCheque.updateMany({
      where: { id, organizationId },
      data: { status: status as PaidChequeStatus },
    });
    const updated = await this.findById(id, organizationId);
    if (!updated) throw new NotFoundError('PaidCheque', id);
    return updated;
  }
}
