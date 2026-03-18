import { Injectable } from '@nestjs/common';
import { BankAccountRepository } from '../../infrastructure/repositories/bank-account.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  BankAccountQueryDto,
} from '@hesabdari/contracts';

@Injectable()
export class BankAccountService {
  constructor(private readonly bankAccountRepository: BankAccountRepository) {}

  async findByOrganization(organizationId: string, query: BankAccountQueryDto) {
    return this.bankAccountRepository.findByOrganization(organizationId, {
      isActive: query.isActive,
      bankId: query.bankId,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async findById(id: string, organizationId: string) {
    const account = await this.bankAccountRepository.findById(id, organizationId);
    if (!account) throw new NotFoundError('BankAccount', id);
    return account;
  }

  async create(organizationId: string, data: CreateBankAccountDto) {
    const existing = await this.bankAccountRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Bank account with code ${data.code} already exists`);
    return this.bankAccountRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      accountNumber: data.accountNumber,
      branch: data.branch ?? '',
      bankId: data.bankId,
      currencyId: data.currencyId,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateBankAccountDto, 'id'>) {
    const account = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.bankAccountRepository.findByCode(
        account.organizationId,
        data.code,
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(`Bank account with code ${data.code} already exists`);
      }
    }
    return this.bankAccountRepository.update(id, data);
  }

  async softDelete(id: string, organizationId: string) {
    await this.findById(id, organizationId);
    return this.bankAccountRepository.update(id, { isActive: false });
  }
}
