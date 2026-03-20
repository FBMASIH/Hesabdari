import { Injectable } from '@nestjs/common';
import { type VendorOpeningBalanceRepository } from '../../infrastructure/repositories/vendor-opening-balance.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateVendorOpeningBalanceDto } from '@hesabdari/contracts';

@Injectable()
export class VendorOpeningBalanceService {
  constructor(private readonly repository: VendorOpeningBalanceRepository) {}

  async findByOrganization(organizationId: string, vendorId?: string) {
    return this.repository.findByOrganization(organizationId, vendorId);
  }

  async create(organizationId: string, data: CreateVendorOpeningBalanceDto) {
    const existing = await this.repository.findUnique(
      organizationId,
      data.vendorId,
      data.currencyId,
    );
    if (existing) {
      throw new ConflictError('Opening balance already exists for this vendor and currency');
    }

    return this.repository.create({
      organizationId,
      vendorId: data.vendorId,
      currencyId: data.currencyId,
      amount: BigInt(data.amount),
      balanceType: data.balanceType,
      description: data.description ?? null,
    });
  }

  async delete(id: string, organizationId: string) {
    const balance = await this.repository.findById(id, organizationId);
    if (!balance) throw new NotFoundError('VendorOpeningBalance', id);
    return this.repository.delete(id, organizationId);
  }
}
