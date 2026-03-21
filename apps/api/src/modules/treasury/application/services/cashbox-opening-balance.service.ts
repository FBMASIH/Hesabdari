import { Injectable } from '@nestjs/common';
import { CashboxOpeningBalanceRepository } from '../../infrastructure/repositories/cashbox-opening-balance.repository';
import { CashboxRepository } from '../../infrastructure/repositories/cashbox.repository';
import { NotFoundError, ApplicationError } from '@/platform/errors';
import type { CreateCashboxOpeningBalanceDto } from '@hesabdari/contracts';

@Injectable()
export class CashboxOpeningBalanceService {
  constructor(
    private readonly repository: CashboxOpeningBalanceRepository,
    private readonly cashboxRepository: CashboxRepository,
  ) {}

  async findByOrganization(organizationId: string, cashboxId?: string) {
    return this.repository.findByOrganization(organizationId, cashboxId);
  }

  async create(organizationId: string, data: CreateCashboxOpeningBalanceDto) {
    // Currency consistency: must match cashbox's currency
    const cashbox = await this.cashboxRepository.findById(data.cashboxId, organizationId);
    if (!cashbox) throw new NotFoundError('Cashbox', data.cashboxId);
    if (cashbox.currencyId !== data.currencyId) {
      throw new ApplicationError(
        'CURRENCY_MISMATCH',
        'Opening balance currency must match the cashbox currency',
      );
    }

    return this.repository.create({
      organizationId,
      cashboxId: data.cashboxId,
      currencyId: data.currencyId,
      amount: BigInt(data.amount),
      date: data.date ?? undefined,
      description: data.description ?? null,
    });
  }

  async delete(id: string, organizationId: string) {
    const balance = await this.repository.findById(id, organizationId);
    if (!balance) throw new NotFoundError('CashboxOpeningBalance', id);
    return this.repository.delete(id, organizationId);
  }
}
