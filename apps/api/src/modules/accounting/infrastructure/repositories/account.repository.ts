import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.account.findUnique({ where: { id } });
  }

  async findByOrganizationId(organizationId: string) {
    return this.prisma.account.findMany({
      where: { organizationId },
      orderBy: { code: 'asc' },
    });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.account.findUnique({
      where: { organizationId_code: { organizationId, code } },
    });
  }

  async create(data: any) {
    return this.prisma.account.create({ data });
  }
}
