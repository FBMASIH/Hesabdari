import { Injectable } from '@nestjs/common';
import { type PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { type AuditService } from '../../../audit/application/services/audit.service';
import { NotFoundError, ApplicationError } from '@/platform/errors';

@Injectable()
export class PeriodService {
  constructor(
    private readonly periodRepository: PeriodRepository,
    private readonly auditService: AuditService,
  ) {}

  async findById(id: string, organizationId: string) {
    const period = await this.periodRepository.findById(id, organizationId);
    if (!period) throw new NotFoundError('AccountingPeriod', id);
    return period;
  }

  async findByOrganization(organizationId: string) {
    return this.periodRepository.findByOrganizationId(organizationId);
  }

  async close(id: string, organizationId: string, closedBy: string) {
    const period = await this.findById(id, organizationId);
    if (period.status === 'CLOSED') {
      throw new ApplicationError('ALREADY_CLOSED', 'This period is already closed');
    }

    const closed = await this.periodRepository.close(id, organizationId, closedBy);

    await this.auditService.log({
      organizationId,
      actorId: closedBy,
      action: 'PERIOD_CLOSED',
      targetType: 'AccountingPeriod',
      targetId: id,
      metadata: { before: { status: 'OPEN' }, after: { status: 'CLOSED' } },
    });

    return closed;
  }
}
