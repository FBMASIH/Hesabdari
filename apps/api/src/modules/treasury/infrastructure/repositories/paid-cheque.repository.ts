import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';
import type { PaidChequeStatus } from '@hesabdari/db';

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

    const [data, total] = await Promise.all([
      this.prisma.paidCheque.findMany({
        where,
        include: { bankAccount: true, vendor: true, currency: true },
        orderBy: { dueDate: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.paidCheque.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string) {
    return this.prisma.paidCheque.findUnique({
      where: { id },
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

  async update(id: string, data: Prisma.PaidChequeUpdateInput) {
    return this.prisma.paidCheque.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.paidCheque.update({
      where: { id },
      data: { status: status as PaidChequeStatus },
    });
  }
}
