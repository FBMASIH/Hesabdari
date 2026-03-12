import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';

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

  async create(data: Prisma.AccountCreateInput) {
    return this.prisma.account.create({ data });
  }
}
