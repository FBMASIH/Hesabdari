import { Injectable } from '@nestjs/common';
import { CustomerOpeningBalanceRepository } from '../../infrastructure/repositories/customer-opening-balance.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateCustomerOpeningBalanceDto } from '@hesabdari/contracts';

@Injectable()
export class CustomerOpeningBalanceService {
  constructor(private readonly repository: CustomerOpeningBalanceRepository) {}

  async findByOrganization(organizationId: string, customerId?: string) {
    return this.repository.findByOrganization(organizationId, customerId);
  }

  async create(organizationId: string, data: CreateCustomerOpeningBalanceDto) {
    // One per customer per currency
    const existing = await this.repository.findUnique(
      organizationId,
      data.customerId,
      data.currencyId,
    );
    if (existing) {
      throw new ConflictError('Opening balance already exists for this customer and currency');
    }

    return this.repository.create({
      organizationId,
      customerId: data.customerId,
      currencyId: data.currencyId,
      amount: BigInt(data.amount),
      balanceType: data.balanceType,
      description: data.description ?? null,
    });
  }

  async delete(id: string, organizationId: string) {
    const balance = await this.repository.findById(id, organizationId);
    if (!balance) throw new NotFoundError('CustomerOpeningBalance', id);
    return this.repository.delete(id, organizationId);
  }
}
