import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

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

  async findById(id: string) {
    return this.prisma.bankOpeningBalance.findUnique({ where: { id } });
  }

  async create(data: {
    organizationId: string;
    bankAccountId: string;
    currencyId: string;
    amount: bigint;
    balanceDate?: Date | null;
    description?: string | null;
  }) {
    return this.prisma.bankOpeningBalance.create({ data });
  }

  async delete(id: string) {
    return this.prisma.bankOpeningBalance.delete({ where: { id } });
  }
}
