import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class PeriodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string) {
    return this.prisma.accountingPeriod.findFirst({ where: { id, organizationId } });
  }

  async findByOrganizationId(organizationId: string) {
    return this.prisma.accountingPeriod.findMany({
      where: { organizationId },
      orderBy: { startDate: 'desc' },
    });
  }

  async close(id: string, organizationId: string, closedBy: string) {
    // Scope update by organizationId — updateMany accepts non-unique where
    const result = await this.prisma.accountingPeriod.updateMany({
      where: { id, organizationId },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy },
    });
    return result;
  }
}
