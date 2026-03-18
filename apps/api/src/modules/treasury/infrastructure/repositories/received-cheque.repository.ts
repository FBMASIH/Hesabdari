import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';
import type { ChequeStatus } from '@hesabdari/db';

@Injectable()
export class ReceivedChequeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(
    organizationId: string,
    opts: {
      status?: string;
      customerId?: string;
      fromDueDate?: Date;
      toDueDate?: Date;
      page: number;
      pageSize: number;
    },
  ) {
    const where: Prisma.ReceivedChequeWhereInput = { organizationId };
    if (opts.status) where.status = opts.status as ChequeStatus;
    if (opts.customerId) where.customerId = opts.customerId;
    if (opts.fromDueDate || opts.toDueDate) {
      where.dueDate = {
        ...(opts.fromDueDate ? { gte: opts.fromDueDate } : {}),
        ...(opts.toDueDate ? { lte: opts.toDueDate } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.receivedCheque.findMany({
        where,
        include: { customer: true, currency: true, depositBankAccount: true },
        orderBy: { dueDate: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.receivedCheque.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.receivedCheque.findFirst({
      where: { id, organizationId },
      include: { customer: true, currency: true, depositBankAccount: true },
    });
  }

  async findBySayadiNumber(organizationId: string, sayadiNumber: string) {
    return this.prisma.receivedCheque.findFirst({
      where: { organizationId, sayadiNumber },
    });
  }

  async create(data: {
    organizationId: string;
    customerId: string;
    currencyId: string;
    chequeNumber: string;
    amount: bigint;
    date: Date;
    dueDate: Date;
    sayadiNumber?: string | null;
    description?: string | null;
  }) {
    return this.prisma.receivedCheque.create({
      data: { ...data, status: 'OPEN' as ChequeStatus },
    });
  }

  async update(id: string, data: Prisma.ReceivedChequeUpdateInput) {
    return this.prisma.receivedCheque.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string, depositBankAccountId?: string | null) {
    const updateData: Prisma.ReceivedChequeUpdateInput = { status: status as ChequeStatus };
    if (depositBankAccountId !== undefined) {
      updateData.depositBankAccount = depositBankAccountId
        ? { connect: { id: depositBankAccountId } }
        : { disconnect: true };
    }
    return this.prisma.receivedCheque.update({ where: { id }, data: updateData });
  }
}
