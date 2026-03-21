import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../infrastructure/repositories/organization.repository';
import { NotFoundError } from '@/platform/errors';

@Injectable()
export class OrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async findById(id: string) {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundError('Organization', id);
    return org;
  }

  async findBySlug(slug: string) {
    return this.organizationRepository.findBySlug(slug);
  }

  async create(data: { name: string; slug: string; defaultCurrencyId: string }) {
    return this.organizationRepository.create(data);
  }

  async updateDefaultCurrency(id: string, defaultCurrencyId: string) {
    await this.findById(id);
    return this.organizationRepository.update(id, { defaultCurrencyId });
  }
}
