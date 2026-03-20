import { Injectable } from '@nestjs/common';
import { type PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class CurrencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(isActive?: boolean) {
    return this.prisma.currency.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.currency.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return this.prisma.currency.findUnique({ where: { code } });
  }

  async create(data: {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isActive: boolean;
  }) {
    return this.prisma.currency.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      symbol: string;
      decimalPlaces: number;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.currency.update({ where: { id }, data });
  }
}
