import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../infrastructure/repositories/period.repository';
import { NotFoundError } from '@/platform/errors';

@Injectable()
export class PeriodService {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async findById(id: string) {
    const period = await this.periodRepository.findById(id);
    if (!period) throw new NotFoundError('AccountingPeriod', id);
    return period;
  }

  async findByOrganization(organizationId: string) {
    return this.periodRepository.findByOrganizationId(organizationId);
  }

  async close(id: string, closedBy: string) {
    return this.periodRepository.close(id, closedBy);
  }
}
