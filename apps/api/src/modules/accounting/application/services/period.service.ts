import { Injectable } from '@nestjs/common';
import { type PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { NotFoundError, ApplicationError } from '@/platform/errors';

@Injectable()
export class PeriodService {
  constructor(private readonly periodRepository: PeriodRepository) {}

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
    return this.periodRepository.close(id, organizationId, closedBy);
  }
}
