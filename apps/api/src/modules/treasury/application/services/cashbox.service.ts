import { Injectable } from '@nestjs/common';
import { CashboxRepository } from '../../infrastructure/repositories/cashbox.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateCashboxDto, UpdateCashboxDto, CashboxQueryDto } from '@hesabdari/contracts';

@Injectable()
export class CashboxService {
  constructor(private readonly cashboxRepository: CashboxRepository) {}

  async findByOrganization(organizationId: string, query: CashboxQueryDto) {
    return this.cashboxRepository.findByOrganization(organizationId, {
      isActive: query.isActive,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
      sortBy: query.sortBy ?? 'code',
      sortOrder: query.sortOrder ?? 'asc',
    });
  }

  async findById(id: string, organizationId: string) {
    const cashbox = await this.cashboxRepository.findById(id, organizationId);
    if (!cashbox) throw new NotFoundError('Cashbox', id);
    return cashbox;
  }

  async create(organizationId: string, data: CreateCashboxDto) {
    const existing = await this.cashboxRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Cashbox with code ${data.code} already exists`);
    return this.cashboxRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      currencyId: data.currencyId,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateCashboxDto, 'id'>) {
    const cashbox = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.cashboxRepository.findByCode(cashbox.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Cashbox with code ${data.code} already exists`);
      }
    }
    return this.cashboxRepository.update(id, organizationId, data);
  }

  async softDelete(id: string, organizationId: string) {
    await this.findById(id, organizationId);
    return this.cashboxRepository.update(id, organizationId, { isActive: false });
  }
}
