import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class BankOpeningBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(organizationId: string, bankAccountId?: string) {
    return this.prisma.bankOpeningBalance.findMany({
      where: {
        organizationId,
        ...(bankAccountId ? { bankAccountId } : {}),
      },
      include: { bankAccount: { include: { bank: true } }, currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.bankOpeningBalance.findFirst({ where: { id, organizationId } });
  }

  async create(data: {
    organizationId: string;
    bankAccountId: string;
    currencyId: string;
    amount: bigint;
    date?: Date;
    description?: string | null;
  }) {
    return this.prisma.bankOpeningBalance.create({ data });
  }

  async delete(id: string) {
    return this.prisma.bankOpeningBalance.delete({ where: { id } });
  }
}
