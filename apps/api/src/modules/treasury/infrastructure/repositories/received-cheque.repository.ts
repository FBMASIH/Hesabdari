import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
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
    const where: any = { organizationId };
    if (opts.status) where.status = opts.status;
    if (opts.customerId) where.customerId = opts.customerId;
    if (opts.fromDueDate || opts.toDueDate) {
      where.dueDate = {};
      if (opts.fromDueDate) where.dueDate.gte = opts.fromDueDate;
      if (opts.toDueDate) where.dueDate.lte = opts.toDueDate;
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

  async findById(id: string) {
    return this.prisma.receivedCheque.findUnique({
      where: { id },
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

  async update(id: string, data: any) {
    return this.prisma.receivedCheque.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string, depositBankAccountId?: string | null) {
    const updateData: any = { status: status as ChequeStatus };
    if (depositBankAccountId !== undefined) {
      updateData.depositBankAccountId = depositBankAccountId;
    }
    return this.prisma.receivedCheque.update({ where: { id }, data: updateData });
  }
}
