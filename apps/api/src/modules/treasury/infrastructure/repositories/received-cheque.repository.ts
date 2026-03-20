import { Injectable } from '@nestjs/common';
import { type PrismaService } from '@/platform/database/prisma.service';
import { NotFoundError } from '@/platform/errors';
import type { Prisma, ChequeStatus, ReceivedCheque } from '@hesabdari/db';

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

  async update(
    id: string,
    organizationId: string,
    data: Prisma.ReceivedChequeUncheckedUpdateInput,
  ): Promise<ReceivedCheque> {
    await this.prisma.receivedCheque.updateMany({ where: { id, organizationId }, data });
    const updated = await this.findById(id, organizationId);
    if (!updated) throw new NotFoundError('ReceivedCheque', id);
    return updated;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: string,
    depositBankAccountId?: string | null,
  ): Promise<ReceivedCheque> {
    const data: Prisma.ReceivedChequeUncheckedUpdateInput = { status: status as ChequeStatus };
    if (depositBankAccountId !== undefined) {
      data.depositBankAccountId = depositBankAccountId ?? null;
    }
    await this.prisma.receivedCheque.updateMany({ where: { id, organizationId }, data });
    const updated = await this.findById(id, organizationId);
    if (!updated) throw new NotFoundError('ReceivedCheque', id);
    return updated;
  }
}
