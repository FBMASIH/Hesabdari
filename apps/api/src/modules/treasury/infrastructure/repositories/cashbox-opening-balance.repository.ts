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

  async findById(id: string, organizationId: string) {
    return this.prisma.cashboxOpeningBalance.findFirst({ where: { id, organizationId } });
  }

  async create(data: {
    organizationId: string;
    cashboxId: string;
    currencyId: string;
    amount: bigint;
    date?: Date;
    description?: string | null;
  }) {
    return this.prisma.cashboxOpeningBalance.create({ data });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.prisma.cashboxOpeningBalance.deleteMany({ where: { id, organizationId } });
  }
}
