import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { BalanceType } from '@hesabdari/db';

@Injectable()
export class VendorOpeningBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(organizationId: string, vendorId?: string) {
    return this.prisma.vendorOpeningBalance.findMany({
      where: {
        organizationId,
        ...(vendorId ? { vendorId } : {}),
      },
      include: { vendor: true, currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.vendorOpeningBalance.findFirst({ where: { id, organizationId } });
  }

  async findUnique(organizationId: string, vendorId: string, currencyId: string) {
    return this.prisma.vendorOpeningBalance.findFirst({
      where: { organizationId, vendorId, currencyId },
    });
  }

  async create(data: {
    organizationId: string;
    vendorId: string;
    currencyId: string;
    amount: bigint;
    balanceType: string;
    description?: string | null;
  }) {
    return this.prisma.vendorOpeningBalance.create({
      data: { ...data, balanceType: data.balanceType as BalanceType },
    });
  }

  async delete(id: string) {
    return this.prisma.vendorOpeningBalance.delete({ where: { id } });
  }
}
