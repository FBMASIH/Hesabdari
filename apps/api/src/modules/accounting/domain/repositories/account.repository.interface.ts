import type { AccountEntity } from '../entities/account.entity';

export interface IAccountRepository {
  findById(id: string, organizationId: string): Promise<AccountEntity | null>;
  findByOrganizationId(organizationId: string): Promise<AccountEntity[]>;
  findByCode(organizationId: string, code: string): Promise<AccountEntity | null>;
  create(data: Omit<AccountEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountEntity>;
}
