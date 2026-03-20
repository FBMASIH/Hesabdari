import { Injectable } from '@nestjs/common';
import { type PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class BankRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bank.findMany({ orderBy: { code: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.bank.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return this.prisma.bank.findUnique({ where: { code } });
  }

  async create(data: { code: string; name: string }) {
    return this.prisma.bank.create({ data });
  }

  async update(id: string, data: Partial<{ code: string; name: string }>) {
    return this.prisma.bank.update({ where: { id }, data });
  }
}
