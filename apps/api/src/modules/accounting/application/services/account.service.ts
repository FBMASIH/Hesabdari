import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../infrastructure/repositories/account.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async findByOrganization(organizationId: string) {
    return this.accountRepository.findByOrganizationId(organizationId);
  }

  async findById(id: string) {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundError('Account', id);
    return account;
  }

  async create(data: {
    organizationId: string;
    code: string;
    name: string;
    type: string;
    parentId?: string;
  }) {
    const existing = await this.accountRepository.findByCode(data.organizationId, data.code);
    if (existing) {
      throw new ConflictError(`Account with code ${data.code} already exists`);
    }
    return this.accountRepository.create({
      ...data,
      parentId: data.parentId ?? null,
      isActive: true,
    } as any);
  }
}
