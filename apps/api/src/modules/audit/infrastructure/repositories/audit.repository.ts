import { Injectable } from '@nestjs/common';
import { type PrismaService } from '@/platform/database/prisma.service';
import type { AuditLog } from '@hesabdari/db';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    organizationId: string;
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        metadata: data.metadata as Parameters<
          typeof this.prisma.auditLog.create
        >[0]['data']['metadata'],
      },
    });
  }

  async findByOrganization(
    organizationId: string,
    options?: { limit?: number },
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
    });
  }
}
