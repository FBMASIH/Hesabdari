import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class ExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(organizationId: string, isActive?: boolean) {
    return this.prisma.expense.findMany({
      where: {
        organizationId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.expense.findFirst({ where: { id, organizationId } });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.expense.findFirst({
      where: { organizationId, code },
    });
  }

  async create(data: { organizationId: string; code: string; name: string; isActive: boolean }) {
    return this.prisma.expense.create({ data });
  }

  async update(id: string, data: Partial<{ code: string; name: string; isActive: boolean }>) {
    return this.prisma.expense.update({ where: { id }, data });
  }
}
