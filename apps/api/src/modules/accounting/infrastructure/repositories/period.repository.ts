import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';

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

  async close(id: string, closedBy: string) {
    return this.prisma.accountingPeriod.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy },
    });
  }
}
