type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface AccountEntity {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
