import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class BankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(
    organizationId: string,
    opts: { isActive?: boolean; bankId?: string; page: number; pageSize: number },
  ) {
    const where = {
      organizationId,
      ...(opts.isActive !== undefined ? { isActive: opts.isActive } : {}),
      ...(opts.bankId ? { bankId: opts.bankId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.bankAccount.findMany({
        where,
        include: { bank: true, currency: true },
        orderBy: { code: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.bankAccount.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.bankAccount.findFirst({
      where: { id, organizationId },
      include: { bank: true, currency: true },
    });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.bankAccount.findFirst({ where: { organizationId, code } });
  }

  async create(data: {
    organizationId: string;
    code: string;
    name: string;
    accountNumber: string;
    branch?: string;
    bankId: string;
    currencyId: string;
    isActive: boolean;
  }) {
    return this.prisma.bankAccount.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      accountNumber: string;
      branch: string;
      bankId: string;
      currencyId: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.bankAccount.update({ where: { id }, data });
  }
}
