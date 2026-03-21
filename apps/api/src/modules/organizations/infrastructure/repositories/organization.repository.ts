import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: { defaultCurrency: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.organization.findUnique({ where: { slug } });
  }

  async create(data: { name: string; slug: string; defaultCurrencyId: string }) {
    return this.prisma.organization.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; slug: string; defaultCurrencyId: string }>) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  async findByUserId(userId: string) {
    return this.prisma.organization.findMany({
      where: { members: { some: { userId } } },
    });
  }
}
