import { Injectable } from '@nestjs/common';
import { type PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string) {
    return this.prisma.account.findFirst({ where: { id, organizationId } });
  }

  async findByOrganizationId(
    organizationId: string,
    opts?: { sortBy?: string; sortOrder?: 'asc' | 'desc' },
  ) {
    const orderBy = { [opts?.sortBy ?? 'code']: opts?.sortOrder ?? 'asc' };
    return this.prisma.account.findMany({
      where: { organizationId },
      orderBy,
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
