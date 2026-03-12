import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class VendorRepository {
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
      this.prisma.vendor.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async search(organizationId: string, q: string) {
    return this.prisma.vendor.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.vendor.findUnique({ where: { id } });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.vendor.findFirst({ where: { organizationId, code } });
  }

  async create(data: {
    organizationId: string;
    code: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    taxId?: string | null;
    isActive: boolean;
  }) {
    return this.prisma.vendor.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      phone: string | null;
      address: string | null;
      taxId: string | null;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.vendor.update({ where: { id }, data });
  }
}
