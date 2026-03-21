import { Injectable } from '@nestjs/common';
import { AuditRepository } from '../../infrastructure/repositories/audit.repository';
import type { AuditLog } from '@hesabdari/db';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async log(data: {
    organizationId: string;
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    return this.auditRepository.create(data);
  }
}
