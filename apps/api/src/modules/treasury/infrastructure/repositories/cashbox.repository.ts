import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class CashboxRepository {
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
      this.prisma.cashbox.findMany({
        where,
        include: { currency: true },
        orderBy: { code: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.cashbox.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.cashbox.findFirst({
      where: { id, organizationId },
      include: { currency: true },
    });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.cashbox.findFirst({ where: { organizationId, code } });
  }

  async create(data: {
    organizationId: string;
    code: string;
    name: string;
    currencyId: string;
    isActive: boolean;
  }) {
    return this.prisma.cashbox.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      currencyId: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.cashbox.update({ where: { id }, data });
  }
}
