import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { BalanceType } from '@hesabdari/db';

@Injectable()
export class CustomerOpeningBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(organizationId: string, customerId?: string) {
    return this.prisma.customerOpeningBalance.findMany({
      where: {
        organizationId,
        ...(customerId ? { customerId } : {}),
      },
      include: { customer: true, currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.customerOpeningBalance.findFirst({ where: { id, organizationId } });
  }

  async findUnique(organizationId: string, customerId: string, currencyId: string) {
    return this.prisma.customerOpeningBalance.findFirst({
      where: { organizationId, customerId, currencyId },
    });
  }

  async create(data: {
    organizationId: string;
    customerId: string;
    currencyId: string;
    amount: bigint;
    balanceType: string;
    description?: string | null;
  }) {
    return this.prisma.customerOpeningBalance.create({
      data: { ...data, balanceType: data.balanceType as BalanceType },
    });
  }

  async delete(id: string) {
    return this.prisma.customerOpeningBalance.delete({ where: { id } });
  }
}
