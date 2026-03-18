import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { NotFoundError } from '@/platform/errors';

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
    await this.findById(id, organizationId);
    return this.periodRepository.close(id, closedBy);
  }
}
