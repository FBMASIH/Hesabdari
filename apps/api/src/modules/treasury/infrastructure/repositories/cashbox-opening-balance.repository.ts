import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class CashboxOpeningBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(organizationId: string, cashboxId?: string) {
    return this.prisma.cashboxOpeningBalance.findMany({
      where: {
        organizationId,
        ...(cashboxId ? { cashboxId } : {}),
      },
      include: { cashbox: true, currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.cashboxOpeningBalance.findUnique({ where: { id } });
  }

  async create(data: {
    organizationId: string;
    cashboxId: string;
    currencyId: string;
    amount: bigint;
    balanceDate?: Date | null;
    description?: string | null;
  }) {
    return this.prisma.cashboxOpeningBalance.create({ data });
  }

  async delete(id: string) {
    return this.prisma.cashboxOpeningBalance.delete({ where: { id } });
  }
}
