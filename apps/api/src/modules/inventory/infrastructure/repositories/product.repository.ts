import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(
    organizationId: string,
    opts: { isActive?: boolean; page: number; pageSize: number },
  ) {
    const where: Prisma.ProductWhereInput = {
      organizationId,
      ...(opts.isActive !== undefined ? { isActive: opts.isActive } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async search(organizationId: string, q: string) {
    return this.prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { barcode: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.product.findFirst({ where: { id, organizationId } });
  }

  async findByCode(organizationId: string, code: string) {
    return this.prisma.product.findFirst({ where: { organizationId, code } });
  }

  async create(data: {
    organizationId: string;
    code: string;
    name: string;
    barcode?: string | null;
    countingUnit: string;
    majorUnit?: string | null;
    minorUnit?: string | null;
    quantityInMajorUnit?: number | null;
    salePrice1: bigint;
    salePrice2: bigint;
    salePrice3: bigint;
    isActive: boolean;
  }) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }
}
