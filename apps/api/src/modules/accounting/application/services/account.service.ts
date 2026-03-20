import { Injectable } from '@nestjs/common';
import { type AccountRepository } from '../../infrastructure/repositories/account.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { AccountType } from '@hesabdari/db';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async findByOrganization(organizationId: string) {
    return this.accountRepository.findByOrganizationId(organizationId);
  }

  async findById(id: string, organizationId: string) {
    const account = await this.accountRepository.findById(id, organizationId);
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
      organization: { connect: { id: data.organizationId } },
      code: data.code,
      name: data.name,
      type: data.type as AccountType,
      parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
      isActive: true,
    });
  }
}
