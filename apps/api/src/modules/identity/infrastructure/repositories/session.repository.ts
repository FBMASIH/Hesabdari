import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRefreshToken(refreshToken: string) {
    return this.prisma.session.findUnique({ where: { refreshToken } });
  }

  async create(data: { userId: string; refreshToken: string; expiresAt: Date }) {
    return this.prisma.session.create({ data });
  }

  async delete(id: string) {
    return this.prisma.session.delete({ where: { id } });
  }

  async deleteAllForUser(userId: string) {
    return this.prisma.session.deleteMany({ where: { userId } });
  }
}
