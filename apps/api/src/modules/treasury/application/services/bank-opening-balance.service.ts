import { Injectable } from '@nestjs/common';
import { type BankOpeningBalanceRepository } from '../../infrastructure/repositories/bank-opening-balance.repository';
import { type BankAccountRepository } from '../../infrastructure/repositories/bank-account.repository';
import { NotFoundError, ApplicationError } from '@/platform/errors';
import type { CreateBankOpeningBalanceDto } from '@hesabdari/contracts';

@Injectable()
export class BankOpeningBalanceService {
  constructor(
    private readonly repository: BankOpeningBalanceRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async findByOrganization(organizationId: string, bankAccountId?: string) {
    return this.repository.findByOrganization(organizationId, bankAccountId);
  }

  async create(organizationId: string, data: CreateBankOpeningBalanceDto) {
    // Currency consistency: must match bank account's currency
    const bankAccount = await this.bankAccountRepository.findById(
      data.bankAccountId,
      organizationId,
    );
    if (!bankAccount) throw new NotFoundError('BankAccount', data.bankAccountId);
    if (bankAccount.currencyId !== data.currencyId) {
      throw new ApplicationError(
        'CURRENCY_MISMATCH',
        'Opening balance currency must match the bank account currency',
      );
    }

    return this.repository.create({
      organizationId,
      bankAccountId: data.bankAccountId,
      currencyId: data.currencyId,
      amount: BigInt(data.amount),
      date: data.date ?? undefined,
      description: data.description ?? null,
    });
  }

  async delete(id: string, organizationId: string) {
    const balance = await this.repository.findById(id, organizationId);
    if (!balance) throw new NotFoundError('BankOpeningBalance', id);
    return this.repository.delete(id, organizationId);
  }
}
