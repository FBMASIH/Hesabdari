import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { CostingMethod } from '@hesabdari/db';

@Injectable()
export class WarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(
    organizationId: string,
    opts: { isActive?: boolean; page: number; pageSize: number },
  ) {
    const where = {
      organizationId,
      ...(opts.isActive !== undefined ? { isActive: opts.isActive } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.warehouse.findFirst({ where: { id, organizationId } });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.warehouse.findFirst({ where: { organizationId, code } });
  }

  async create(data: {
    organizationId: string;
    code: string;
    name: string;
    costingMethod: CostingMethod;
    isActive: boolean;
  }) {
    return this.prisma.warehouse.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      costingMethod: CostingMethod;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }
}
