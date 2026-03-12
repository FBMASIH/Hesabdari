import { Module } from '@nestjs/common';
import { AuditService } from './application/services/audit.service';
import { AuditRepository } from './infrastructure/repositories/audit.repository';

@Module({
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
